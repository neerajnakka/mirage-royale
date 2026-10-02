import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { GameActionPayload, RoomState, StoredGameResponse } from './types';
import { applyGameAction, createRoomState, generateRoomCode } from './engine';

interface StoredRecord {
  room: RoomState;
  etag: string;
}

const memoryRooms = new Map<string, StoredRecord>();
const ROOM_TTL_SECONDS = 60 * 60 * 24;
const ABSENT_ETAG = '__mirage_absent__';

const CAS_WRITE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
local expected = ARGV[1]
if expected == '${ABSENT_ETAG}' then
  if current then return 0 end
else
  if not current then return 0 end
  local ok, record = pcall(cjson.decode, current)
  if not ok or record.etag ~= expected then return 0 end
end
redis.call('SET', KEYS[1], ARGV[3], 'EX', tonumber(ARGV[2]))
return 1
`;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

function assertStorageConfigured(): void {
  if (process.env.VERCEL && !upstashConfig()) {
    throw new Error(
      'Shared game storage is not connected yet. In Vercel, add an Upstash Redis database from the Marketplace and redeploy.'
    );
  }
}

function storageKey(code: string): string {
  return `mirage:room:${code.toUpperCase()}`;
}

function makeSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function secureTokenMatches(storedHash: string | undefined, suppliedToken: string | undefined): boolean {
  if (!storedHash || !suppliedToken) return false;
  const suppliedHash = hashSessionToken(suppliedToken);
  const stored = Buffer.from(storedHash, 'hex');
  const supplied = Buffer.from(suppliedHash, 'hex');
  return stored.length === supplied.length && timingSafeEqual(stored, supplied);
}

function actorId(payload: GameActionPayload): string | undefined {
  if (payload.action === 'add_bot' || payload.action === 'remove_player') return payload.hostId;
  if ('playerId' in payload) return payload.playerId;
  return undefined;
}

function sanitizeRoomForPlayer(source: RoomState, playerId?: string): RoomState {
  const room = clone(source);
  const canReveal = room.phase === 'round_reveal' || room.phase === 'game_over';

  // Session hashes are private server credentials and never belong in a browser response.
  for (const player of room.players) {
    delete player.sessionTokenHash;
    if (!canReveal && player.id !== playerId) {
      // Conceal other players' one-shot tactical choices until the round is declassified.
      player.activeGambit = null;
      player.gambits = { truth_radar: true, double_agent: true, shield_bet: true };
      player.eliminatedOptionId = null;
    }
  }

  if (!canReveal && room.currentPrompt) {
    room.currentPrompt.truth = '';
    room.currentPrompt.acceptedTruthSynonyms = [];
    room.currentPrompt.houseDecoys = [];
    room.currentPrompt.factoid = '';
  }

  if (!canReveal) {
    const hiddenSubmissions: RoomState['submissions'] = {};
    for (const [id, submission] of Object.entries(room.submissions)) {
      hiddenSubmissions[id] =
        id === playerId
          ? submission
          : {
              playerId: id,
              text: '',
              wager: 1,
              gambitUsed: null,
              submittedAt: submission.submittedAt,
            };
    }
    room.submissions = hiddenSubmissions;

    room.lineup = room.lineup.map((option) => ({
      ...option,
      // No truth flag, author identity, house-decoy label, or public voting trail during simultaneous voting.
      isTruth: false,
      authorIds: playerId && option.authorIds.includes(playerId) ? [playerId] : [],
      isHouseDecoy: false,
      voterIds: [],
      kudosVoterIds: [],
    }));

    const privateVote = room.votes[playerId || ''];
    room.votes = Object.fromEntries(
      Object.keys(room.votes).map((id) => [id, id === playerId ? privateVote : ''])
    );
    const privateKudos = room.kudosVotes[playerId || ''];
    room.kudosVotes = Object.fromEntries(
      Object.keys(room.kudosVotes).map((id) => [id, id === playerId ? privateKudos : ''])
    );
  }

  return room;
}

async function upstashRequest<T>(commandPath: string, init?: RequestInit): Promise<T> {
  const config = upstashConfig();
  if (!config) throw new Error('Upstash Redis is not configured.');
  const response = await fetch(`${config.url}/${commandPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Shared room storage failed (${response.status}). Please retry.`);
  }
  let result: { result?: unknown; error?: string };
  try {
    result = JSON.parse(text) as { result?: unknown; error?: string };
  } catch {
    throw new Error('Shared room storage returned an unreadable response.');
  }
  if (result.error) throw new Error('Shared room storage rejected the request.');
  return result.result as T;
}

async function readRoomWithEtag(
  code: string
): Promise<{ room: RoomState | null; etag: string | null }> {
  assertStorageConfigured();
  const config = upstashConfig();
  const key = storageKey(code);

  if (config) {
    const raw = await upstashRequest<string | null>(`get/${encodeURIComponent(key)}`);
    if (!raw) return { room: null, etag: null };
    const parsed = JSON.parse(raw) as StoredRecord;
    return { room: parsed.room, etag: parsed.etag };
  }

  const record = memoryRooms.get(key);
  if (!record) return { room: null, etag: null };
  return { room: clone(record.room), etag: record.etag };
}

async function writeRoomConditional(
  code: string,
  room: RoomState,
  expectedEtag: string | null
): Promise<boolean> {
  assertStorageConfigured();
  const key = storageKey(code);
  const newEtag = `v${room.version}-${Date.now()}-${randomBytes(5).toString('hex')}`;
  const record: StoredRecord = { room: clone(room), etag: newEtag };
  const serialized = JSON.stringify(record);
  const config = upstashConfig();

  if (config) {
    // EVAL executes the compare-and-set atomically at Redis, preventing two serverless
    // instances from overwriting each other's joins, ballots, or score updates.
    const commandPath = [
      'eval',
      encodeURIComponent(CAS_WRITE_SCRIPT),
      '1',
      encodeURIComponent(key),
      encodeURIComponent(expectedEtag ?? ABSENT_ETAG),
      String(ROOM_TTL_SECONDS),
    ].join('/');
    const result = await upstashRequest<number>(commandPath, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: serialized,
    });
    return Number(result) === 1;
  }

  // The local Vite preview uses an in-process store. Production Vercel deliberately
  // refuses this fallback because independent function instances do not share memory.
  const existing = memoryRooms.get(key);
  if (expectedEtag === null ? Boolean(existing) : !existing || existing.etag !== expectedEtag) {
    return false;
  }
  memoryRooms.set(key, record);
  return true;
}

function requireSession(room: RoomState, payload: GameActionPayload, playerId: string): void {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Your player session is no longer in this room. Rejoin with a new name.');
  if (!secureTokenMatches(player.sessionTokenHash, payload.sessionToken)) {
    throw new Error('Your secure session expired or is invalid. Rejoin from this device to continue.');
  }
}

function publicResponse(
  room: RoomState,
  playerId?: string,
  sessionToken?: string
): StoredGameResponse {
  return {
    room: sanitizeRoomForPlayer(room, playerId),
    ...(playerId ? { playerId } : {}),
    ...(sessionToken ? { sessionToken } : {}),
  };
}

export async function processGameRequest(payload: GameActionPayload): Promise<StoredGameResponse> {
  assertStorageConfigured();

  if (payload.action === 'create_room') {
    const sessionToken = makeSessionToken();
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = generateRoomCode();
      const { room, playerId } = createRoomState({
        code,
        hostName: payload.hostName,
        avatar: payload.avatar,
        color: payload.color,
        timerSeconds: payload.timerSeconds,
      });
      const host = room.players.find((p) => p.id === playerId)!;
      host.sessionTokenHash = hashSessionToken(sessionToken);
      if (await writeRoomConditional(code, room, null)) {
        return publicResponse(room, playerId, sessionToken);
      }
    }
    throw new Error('Could not allocate a unique room code. Please try again.');
  }

  const code = payload.code?.trim().toUpperCase();
  if (!code) throw new Error('Room code is required.');

  if (payload.action === 'get_room') {
    const { room } = await readRoomWithEtag(code);
    if (!room) throw new Error(`Room "${code}" not found. Double-check the 4-letter code!`);
    if (payload.playerId) requireSession(room, payload, payload.playerId);
    return publicResponse(room, payload.playerId);
  }

  const isJoin = payload.action === 'join_room';
  let joinPlayerId = isJoin ? payload.playerId : undefined;
  let joinToken = isJoin ? payload.sessionToken : undefined;

  if (isJoin && (!joinPlayerId || !joinToken)) {
    joinPlayerId = `p-${Date.now().toString(36)}-${randomBytes(5).toString('hex')}`;
    joinToken = makeSessionToken();
  }

  const MAX_RETRIES = 8;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { room, etag } = await readRoomWithEtag(code);
    if (!room) throw new Error(`Room "${code}" not found. Double-check the 4-letter code!`);

    let actionPayload = payload;
    let responsePlayerId = actorId(payload);
    let responseToken: string | undefined;

    if (isJoin) {
      const requestedId = joinPlayerId!;
      const existingById = room.players.find((player) => player.id === requestedId);
      if (existingById) {
        requireSession(room, { ...payload, sessionToken: joinToken }, requestedId);
        responsePlayerId = requestedId;
        responseToken = joinToken;
      } else {
        // A name cannot silently reclaim another device's authenticated identity.
        const duplicateName = room.players.find(
          (player) => player.name.toLowerCase() === payload.playerName.trim().toLowerCase()
        );
        if (duplicateName) {
          throw new Error('That callsign is already in use. Rejoin from the original device or choose another name.');
        }
        responsePlayerId = requestedId;
        responseToken = joinToken;
      }
      actionPayload = { ...payload, playerId: requestedId, sessionToken: joinToken };
    } else {
      const id = actorId(payload);
      if (!id) throw new Error('Player identity is required for this action.');
      requireSession(room, payload, id);
      responsePlayerId = id;
    }

    const workingCopy = clone(room);
    const result = applyGameAction(workingCopy, actionPayload);

    if (isJoin) {
      const joinedPlayer = result.room.players.find((player) => player.id === responsePlayerId);
      if (!joinedPlayer) throw new Error('Could not establish player identity in this room.');
      // New players receive a fresh random credential. Existing authenticated sessions keep theirs.
      if (!room.players.some((player) => player.id === responsePlayerId)) {
        joinedPlayer.sessionTokenHash = hashSessionToken(responseToken!);
      }
    }

    if (await writeRoomConditional(code, result.room, etag)) {
      return publicResponse(result.room, responsePlayerId, responseToken);
    }
  }

  throw new Error('High activity in room — please retry your action.');
}

export function clearLocalRoomsForTesting(): void {
  memoryRooms.clear();
}
