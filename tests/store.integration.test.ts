import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearLocalRoomsForTesting, processGameRequest } from '../src/lib/store';
import { GameActionPayload, StoredGameResponse } from '../src/lib/types';

async function send(payload: GameActionPayload): Promise<StoredGameResponse> {
  return processGameRequest(payload);
}

describe('shared room request integration', () => {
  beforeEach(() => {
    delete process.env.VERCEL;
    clearLocalRoomsForTesting();
  });

  afterEach(() => clearLocalRoomsForTesting());

  it('creates and joins a room with per-device credentials; blocks forged identities and redacts secrets', async () => {
    const host = await send({
      action: 'create_room',
      hostName: 'Rae',
      avatar: '🦊',
      color: '#00F2FE',
      timerSeconds: 0,
    });
    const code = host.room.code;
    expect(host.playerId).toBeTruthy();
    expect(host.sessionToken).toBeTruthy();
    expect(host.room.players[0].sessionTokenHash).toBeUndefined();

    const guest = await send({
      action: 'join_room',
      code,
      playerName: 'Milo',
      avatar: '🐙',
      color: '#FF2A85',
    });
    expect(guest.playerId).toBeTruthy();
    expect(guest.sessionToken).toBeTruthy();
    expect(guest.room.players).toHaveLength(2);

    await expect(
      send({ action: 'get_room', code, playerId: host.playerId! })
    ).rejects.toThrow(/session expired or is invalid/);

    // A different player cannot impersonate the host, even though public player IDs are visible.
    await expect(
      send({
        action: 'start_game',
        code,
        playerId: host.playerId!,
        sessionToken: guest.sessionToken,
      })
    ).rejects.toThrow(/session expired or is invalid/);

    const readyGuest = await send({
      action: 'toggle_ready',
      code,
      playerId: guest.playerId!,
      sessionToken: guest.sessionToken,
    });
    expect(readyGuest.room.players.find((p) => p.id === guest.playerId)?.isReady).toBe(true);

    const started = await send({
      action: 'start_game',
      code,
      playerId: host.playerId!,
      sessionToken: host.sessionToken,
    });
    expect(started.room.phase).toBe('category_select');

    const categoryId = started.room.categoryOptions[0].id;
    await send({
      action: 'vote_category',
      code,
      playerId: host.playerId!,
      categoryId,
      sessionToken: host.sessionToken,
    });
    const bluffStage = await send({
      action: 'vote_category',
      code,
      playerId: guest.playerId!,
      categoryId,
      sessionToken: guest.sessionToken,
    });
    expect(bluffStage.room.phase).toBe('write_bluff');
    expect(bluffStage.room.currentPrompt?.question).toBeTruthy();
    expect(bluffStage.room.currentPrompt?.truth).toBe('');
    expect(bluffStage.room.currentPrompt?.acceptedTruthSynonyms).toHaveLength(0);

    await send({
      action: 'submit_bluff',
      code,
      playerId: host.playerId!,
      text: 'a ruby canoe with a brass propeller',
      wager: 2,
      gambit: 'double_agent',
      sessionToken: host.sessionToken,
    });
    const lineupResponse = await send({
      action: 'submit_bluff',
      code,
      playerId: guest.playerId!,
      text: 'a seven-legged moon penguin',
      wager: 1,
      gambit: null,
      sessionToken: guest.sessionToken,
    });
    expect(lineupResponse.room.phase).toBe('vote_truth');
    expect(lineupResponse.room.lineup.length).toBeGreaterThanOrEqual(4);
    expect(lineupResponse.room.lineup.every((option) => option.isTruth === false)).toBe(true);
    expect(lineupResponse.room.lineup.every((option) => option.id !== 'opt-truth')).toBe(true);

    const hostPrivateView = await send({
      action: 'get_room',
      code,
      playerId: host.playerId!,
      sessionToken: host.sessionToken,
    });
    expect(hostPrivateView.room.lineup.some((option) => option.authorIds.includes(host.playerId!))).toBe(true);
    expect(hostPrivateView.room.lineup.some((option) => option.authorIds.includes(guest.playerId!))).toBe(false);
    expect(hostPrivateView.room.submissions[host.playerId!].text).toBe('a ruby canoe with a brass propeller');
    expect(hostPrivateView.room.submissions[guest.playerId!].text).toBe('');
    expect(hostPrivateView.room.players.every((player) => !('sessionTokenHash' in player))).toBe(true);
  });

  it('survives concurrent room joins without losing players (local optimistic compare-and-set)', async () => {
    const host = await send({
      action: 'create_room',
      hostName: 'Host',
      avatar: '🦊',
      color: '#00F2FE',
      timerSeconds: 0,
    });
    const names = ['Ash', 'Bea', 'Cal', 'Dee', 'Eli'];
    const joined = await Promise.all(
      names.map((name, index) =>
        send({
          action: 'join_room',
          code: host.room.code,
          playerName: name,
          avatar: ['🐙', '🦉', '🦈', '🦄', '🐲'][index],
          color: ['#FF2A85', '#FFB800', '#00E699', '#A855F7', '#FF6B35'][index],
        })
      )
    );

    expect(joined.every((response) => Boolean(response.playerId && response.sessionToken))).toBe(true);
    const latest = await send({ action: 'get_room', code: host.room.code });
    expect(latest.room.players).toHaveLength(6);
    expect(new Set(latest.room.players.map((player) => player.name)).size).toBe(6);
  });

  it('requires Upstash Redis on Vercel instead of silently using per-instance memory', async () => {
    process.env.VERCEL = '1';
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    await expect(
      send({ action: 'create_room', hostName: 'Host', avatar: '🦊', color: '#00F2FE' })
    ).rejects.toThrow(/Upstash Redis database/);
  });
});
