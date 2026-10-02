import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, ViteDevServer } from 'vite';

describe('HTTP multiplayer match integration (local Vite API)', () => {
  let server: ViteDevServer;
  let baseUrl = '';

  beforeAll(async () => {
    server = await createServer({
      configFile: 'vite.config.ts',
      server: { host: '127.0.0.1', port: 0, strictPort: false },
      clearScreen: false,
      logLevel: 'error',
    });
    await server.listen();
    const address = server.httpServer?.address();
    if (!address || typeof address === 'string') throw new Error('Vite test server did not bind a TCP port.');
    baseUrl = `http://127.0.0.1:${address.port}/api/game`;
  }, 20_000);

  afterAll(async () => {
    await server?.close();
  });

  it('plays three complete rounds with two authenticated devices, preserves hidden truth, and reaches a winner', async () => {
    const post = async (payload: Record<string, unknown>) => {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || `Unexpected HTTP ${response.status}`);
      return body as any;
    };

    const hostCreated = await post({
      action: 'create_room', hostName: 'HTTP Host', avatar: '🦊', color: '#00F2FE', timerSeconds: 0,
    });
    const code = hostCreated.room.code as string;
    const host = { id: hostCreated.playerId as string, token: hostCreated.sessionToken as string };
    const guestJoined = await post({
      action: 'join_room', code, playerName: 'HTTP Guest', avatar: '🐙', color: '#FF2A85',
    });
    const guest = { id: guestJoined.playerId as string, token: guestJoined.sessionToken as string };

    await post({ action: 'toggle_ready', code, playerId: guest.id, sessionToken: guest.token });
    const started = await post({ action: 'start_game', code, playerId: host.id, sessionToken: host.token });
    expect(started.room.phase).toBe('category_select');

    const scoreSnapshots: number[][] = [];
    for (let round = 1; round <= 3; round++) {
      let hostView = (await post({ action: 'get_room', code, playerId: host.id, sessionToken: host.token })).room;
      let guestView = (await post({ action: 'get_room', code, playerId: guest.id, sessionToken: guest.token })).room;
      expect(hostView.phase).toBe('category_select');
      const categoryId = hostView.categoryOptions[0].id;
      await post({ action: 'vote_category', code, playerId: host.id, categoryId, sessionToken: host.token });
      const bluffStage = await post({ action: 'vote_category', code, playerId: guest.id, categoryId, sessionToken: guest.token });
      expect(bluffStage.room.phase).toBe('write_bluff');
      expect(bluffStage.room.currentPrompt.truth).toBe('');
      expect(bluffStage.room.currentPrompt.acceptedTruthSynonyms).toEqual([]);

      await post({
        action: 'submit_bluff', code, playerId: host.id,
        text: `a taxidermy orchestra with ${round} conductors`, wager: round === 1 ? 2 : 1,
        gambit: round === 1 ? 'double_agent' : null, sessionToken: host.token,
      });
      const lineup = await post({
        action: 'submit_bluff', code, playerId: guest.id,
        text: `an unlicensed moon-parking permit number ${round}`, wager: round === 3 ? 3 : 1,
        gambit: round === 1 ? 'shield_bet' : null, sessionToken: guest.token,
      });
      expect(lineup.room.phase).toBe('vote_truth');
      expect(lineup.room.lineup.length).toBeGreaterThanOrEqual(4);
      expect(lineup.room.lineup.every((option: any) => option.isTruth === false)).toBe(true);
      expect(lineup.room.lineup.every((option: any) => option.id !== 'opt-truth')).toBe(true);

      hostView = (await post({ action: 'get_room', code, playerId: host.id, sessionToken: host.token })).room;
      guestView = (await post({ action: 'get_room', code, playerId: guest.id, sessionToken: guest.token })).room;
      const hostChoice = hostView.lineup.find((option: any) => !option.authorIds.includes(host.id));
      const guestChoice = guestView.lineup.find((option: any) => !option.authorIds.includes(guest.id));
      expect(hostChoice).toBeTruthy();
      expect(guestChoice).toBeTruthy();

      await post({ action: 'toggle_kudos', code, playerId: host.id, optionId: hostChoice.id, sessionToken: host.token });
      await post({ action: 'toggle_kudos', code, playerId: guest.id, optionId: guestChoice.id, sessionToken: guest.token });
      await post({ action: 'submit_vote', code, playerId: host.id, optionId: hostChoice.id, sessionToken: host.token });
      const revealed = await post({ action: 'submit_vote', code, playerId: guest.id, optionId: guestChoice.id, sessionToken: guest.token });
      expect(revealed.room.phase).toBe('round_reveal');
      expect(revealed.room.currentPrompt.truth).not.toBe('');
      expect(revealed.room.lineup.some((option: any) => option.isTruth)).toBe(true);

      let revealRoom = revealed.room;
      for (let step = 0; step < revealRoom.lineup.length; step++) {
        revealRoom = (await post({ action: 'advance_reveal_step', code, playerId: host.id, sessionToken: host.token })).room;
      }
      expect(revealRoom.revealStep).toBe(revealRoom.lineup.length);
      scoreSnapshots.push(revealRoom.players.map((player: any) => player.score));
      const next = await post({
        action: 'next_phase', code, playerId: host.id,
        expectedPhase: 'round_reveal', expectedPhaseStartedAt: revealRoom.phaseStartedAt,
        sessionToken: host.token,
      });
      expect(next.room.phase).toBe(round < 3 ? 'category_select' : 'game_over');
    }

    const final = await post({ action: 'get_room', code, playerId: host.id, sessionToken: host.token });
    expect(final.room.history).toHaveLength(3);
    expect(final.room.awards.length).toBeGreaterThanOrEqual(3);
    expect(final.room.players).toHaveLength(2);
    expect(final.room.phase).toBe('game_over');
    const winner = [...final.room.players].sort((a: any, b: any) => b.score - a.score)[0];
    expect(final.room.players.some((player: any) => player.id === winner.id)).toBe(true);
    expect(scoreSnapshots).toHaveLength(3);

    // A host rematch resets score and match history without changing the room code or identities.
    const rematch = await post({ action: 'restart_game', code, playerId: host.id, sessionToken: host.token });
    expect(rematch.room.phase).toBe('category_select');
    expect(rematch.room.history).toHaveLength(0);
    expect(rematch.room.players.every((player: any) => player.score === 0)).toBe(true);
  }, 30_000);
});
