import { GameActionPayload, RoomState, StoredGameResponse } from './types';

// The Vercel Node function lives at api/game.ts; local Vite middleware mirrors it.
const GAME_ENDPOINT = '/api/game';
const SESSION_PREFIX = 'mirage-session:';

export interface LocalSession {
  playerId: string;
  sessionToken: string;
}

export function saveSession(code: string, session: LocalSession): void {
  try {
    localStorage.setItem(`${SESSION_PREFIX}${code.toUpperCase()}`, JSON.stringify(session));
  } catch {
    // Private-browsing storage can be disabled; the in-memory game session still works until refresh.
  }
}

export function loadSession(code: string): LocalSession | null {
  try {
    const raw = localStorage.getItem(`${SESSION_PREFIX}${code.toUpperCase()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalSession;
    return parsed.playerId && parsed.sessionToken ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSession(code: string): void {
  try {
    localStorage.removeItem(`${SESSION_PREFIX}${code.toUpperCase()}`);
  } catch {
    // ignore
  }
}

export async function callGameApi(payload: GameActionPayload): Promise<StoredGameResponse> {
  let body: GameActionPayload = payload;
  if (payload.action !== 'create_room') {
    const session = loadSession(payload.code);
    if (session) {
      body = {
        ...payload,
        ...(!('playerId' in payload) || !payload.playerId ? { playerId: session.playerId } : {}),
        sessionToken: session.sessionToken,
      } as GameActionPayload;
    }
  }

  const response = await fetch(GAME_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'Failed to communicate with game server');
  }

  const result: StoredGameResponse = {
    room: data.room as RoomState,
    playerId: data.playerId,
    sessionToken: data.sessionToken,
  };

  if (result.playerId && result.sessionToken && result.room?.code) {
    saveSession(result.room.code, {
      playerId: result.playerId,
      sessionToken: result.sessionToken,
    });
  }

  return result;
}

export async function pollRoomState(code: string): Promise<RoomState> {
  const session = loadSession(code);
  const response = await callGameApi({
    action: 'get_room',
    code,
    ...(session ? { playerId: session.playerId, sessionToken: session.sessionToken } : {}),
  });
  return response.room;
}
