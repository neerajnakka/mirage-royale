import { describe, expect, it } from 'vitest';
import { applyGameAction, createRoomState, resolveRoundScores, isTooCloseToTruth } from '../src/lib/engine';
import { GameActionPayload, RoomState, WagerMultiplier } from '../src/lib/types';

function action(room: RoomState, payload: GameActionPayload): RoomState {
  return applyGameAction(room, payload).room;
}

function setupTwoPlayers(): { room: RoomState; hostId: string; guestId: string } {
  const { room } = createRoomState({
    code: 'TEST',
    hostId: 'host-player',
    hostName: 'Host',
    avatar: '🦊',
    color: '#00F2FE',
    timerSeconds: 0,
  });
  room.settings.roundTimerSeconds = 0;
  action(room, {
    action: 'join_room',
    code: 'TEST',
    playerId: 'guest-player',
    playerName: 'Guest',
    avatar: '🐙',
    color: '#FF2A85',
  });
  let next = action(room, { action: 'toggle_ready', code: 'TEST', playerId: 'guest-player' });
  next = action(next, { action: 'start_game', code: 'TEST', playerId: 'host-player' });
  return { room: next, hostId: 'host-player', guestId: 'guest-player' };
}

function moveToBluff(room: RoomState, hostId: string, guestId: string): RoomState {
  const categoryId = room.categoryOptions[0].id;
  room = action(room, { action: 'vote_category', code: room.code, playerId: hostId, categoryId });
  room = action(room, { action: 'vote_category', code: room.code, playerId: guestId, categoryId });
  expect(room.phase).toBe('write_bluff');
  return room;
}

function submitBluffs(
  room: RoomState,
  hostId: string,
  guestId: string,
  round: number,
  hostWager: WagerMultiplier,
  guestWager: WagerMultiplier,
  guestGambit: 'shield_bet' | null = null,
  hostGambit: 'double_agent' | null = null
): RoomState {
  room = action(room, {
    action: 'submit_bluff',
    code: room.code,
    playerId: hostId,
    text: `a moonlit taxidermy contest numbered ${round}`,
    wager: hostWager,
    gambit: hostGambit,
  });
  room = action(room, {
    action: 'submit_bluff',
    code: room.code,
    playerId: guestId,
    text: `an unusually polite lighthouse keeper ${round}`,
    wager: guestWager,
    gambit: guestGambit,
  });
  expect(room.phase).toBe('vote_truth');
  expect(room.lineup.length).toBeGreaterThanOrEqual(4);
  return room;
}

function voteFor(room: RoomState, playerId: string, optionId: string): RoomState {
  return action(room, { action: 'submit_vote', code: room.code, playerId, optionId });
}

function finishReveal(room: RoomState, hostId: string): RoomState {
  for (let i = 0; i < room.lineup.length; i++) {
    room = action(room, { action: 'advance_reveal_step', code: room.code, playerId: hostId });
  }
  expect(room.revealStep).toBe(room.lineup.length);
  return action(room, {
    action: 'next_phase',
    code: room.code,
    playerId: hostId,
    expectedPhase: 'round_reveal',
    expectedPhaseStartedAt: room.phaseStartedAt,
  });
}

describe('Mirage Royale game rules', () => {
  it('rejects the real answer when a player tries to submit it as a bluff', () => {
    const { room, hostId, guestId } = setupTwoPlayers();
    let current = moveToBluff(room, hostId, guestId);
    expect(current.currentPrompt?.truth).toBeTruthy();
    expect(() =>
      action(current, {
        action: 'submit_bluff',
        code: current.code,
        playerId: hostId,
        text: current.currentPrompt!.truth,
        wager: 1,
        gambit: null,
      })
    ).toThrow(/TRUTH_INTERCEPTED/);
  });

  it('normalizes accepted variants and does not treat unrelated text as the truth', () => {
    const { room, hostId, guestId } = setupTwoPlayers();
    const current = moveToBluff(room, hostId, guestId);
    const prompt = current.currentPrompt!;
    expect(isTooCloseToTruth(prompt.truth.toUpperCase(), prompt)).toBe(true);
    expect(isTooCloseToTruth('a moonlit taxidermy contest', prompt)).toBe(false);
  });

  it('prevents self-voting and lets a player spend a single private Truth Radar scan', () => {
    const { room, hostId, guestId } = setupTwoPlayers();
    let current = moveToBluff(room, hostId, guestId);
    current = submitBluffs(current, hostId, guestId, 1, 1, 1);
    const hostBluff = current.lineup.find((option) => option.authorIds.includes(hostId))!;
    expect(() => voteFor(current, hostId, hostBluff.id)).toThrow(/own forgery/);

    const beforeAvailable = current.players.find((player) => player.id === hostId)!.gambits.truth_radar;
    current = action(current, { action: 'use_truth_radar', code: current.code, playerId: hostId });
    const after = current.players.find((player) => player.id === hostId)!;
    expect(after.gambits.truth_radar).toBe(false);
    expect(after.eliminatedOptionId).toBeTruthy();
    expect(current.lineup.some((option) => option.id === after.eliminatedOptionId && option.isTruth)).toBe(false);
    expect(beforeAvailable).toBe(true);
    expect(() => action(current, { action: 'use_truth_radar', code: current.code, playerId: hostId })).toThrow(/already used/);
  });

  it('scores wager risk, bluff bounty, streaks, Kudos, Aegis, finale multiplier, and the winner across three rounds', () => {
    let { room, hostId, guestId } = setupTwoPlayers();
    let p1 = room.players.find((player) => player.id === hostId)!;
    let p2 = room.players.find((player) => player.id === guestId)!;
    expect(p1.isHost).toBe(true);
    expect(p2.isReady).toBe(true);

    // Round 1: double-agent bluff fools the other player; Aegis cancels a 3x wager loss.
    room = moveToBluff(room, hostId, guestId);
    room = submitBluffs(room, hostId, guestId, 1, 2, 3, 'shield_bet', 'double_agent');
    const hostFake = room.lineup.find((option) => option.authorIds.includes(hostId))!;
    const truth1 = room.lineup.find((option) => option.isTruth)!;
    room = action(room, { action: 'toggle_kudos', code: room.code, playerId: guestId, optionId: hostFake.id });
    room = voteFor(room, hostId, truth1.id);
    room = voteFor(room, guestId, hostFake.id);
    expect(room.phase).toBe('round_reveal');
    const hostBreakdown1 = room.lastRoundBreakdowns.find((entry) => entry.playerId === hostId)!;
    const guestBreakdown1 = room.lastRoundBreakdowns.find((entry) => entry.playerId === guestId)!;
    expect(hostBreakdown1.truthPoints).toBe(1000);
    expect(hostBreakdown1.fooledPoints).toBe(800);
    expect(hostBreakdown1.kudosBonus).toBe(150);
    expect(hostBreakdown1.totalDelta).toBe(1950);
    expect(guestBreakdown1.wagerPenalty).toBe(0);
    expect(guestBreakdown1.shieldBonus).toBe(200);
    expect(guestBreakdown1.totalDelta).toBe(200);
    room = finishReveal(room, hostId);

    // Round 2: both score truth/bluff normally; the host earns the two-round truth streak.
    room = moveToBluff(room, hostId, guestId);
    room = submitBluffs(room, hostId, guestId, 2, 1, 1);
    const hostFake2 = room.lineup.find((option) => option.authorIds.includes(hostId))!;
    const truth2 = room.lineup.find((option) => option.isTruth)!;
    room = voteFor(room, hostId, truth2.id);
    room = voteFor(room, guestId, hostFake2.id);
    const hostBreakdown2 = room.lastRoundBreakdowns.find((entry) => entry.playerId === hostId)!;
    expect(hostBreakdown2.truthPoints).toBe(500);
    expect(hostBreakdown2.streakBonus).toBe(250);
    expect(hostBreakdown2.fooledPoints).toBe(400);
    room = finishReveal(room, hostId);

    // Round 3: finale doubles the truth payout; a wrong 3x bet costs 500.
    room = moveToBluff(room, hostId, guestId);
    room = submitBluffs(room, hostId, guestId, 3, 1, 3);
    const hostFake3 = room.lineup.find((option) => option.authorIds.includes(hostId))!;
    const truth3 = room.lineup.find((option) => option.isTruth)!;
    room = voteFor(room, hostId, truth3.id);
    room = voteFor(room, guestId, hostFake3.id);
    const hostBreakdown3 = room.lastRoundBreakdowns.find((entry) => entry.playerId === hostId)!;
    const guestBreakdown3 = room.lastRoundBreakdowns.find((entry) => entry.playerId === guestId)!;
    expect(hostBreakdown3.truthPoints).toBe(1000);
    expect(hostBreakdown3.streakBonus).toBe(250);
    expect(hostBreakdown3.fooledPoints).toBe(400);
    expect(guestBreakdown3.wagerPenalty).toBe(500);
    expect(guestBreakdown3.totalDelta).toBe(-500);
    room = finishReveal(room, hostId);

    expect(room.phase).toBe('game_over');
    expect(room.players.find((player) => player.id === hostId)!.score).toBe(4750);
    expect(room.players.find((player) => player.id === guestId)!.score).toBe(-300);
    expect(room.history).toHaveLength(3);
    expect(room.awards.length).toBeGreaterThanOrEqual(3);
    expect([...room.players].sort((a, b) => b.score - a.score)[0].id).toBe(hostId);
  });

  it('requires every human to ready up and only allows the host to advance a stage', () => {
    const { room } = createRoomState({
      code: 'READY',
      hostId: 'ready-host',
      hostName: 'Host',
      avatar: '🦊',
      color: '#00F2FE',
      timerSeconds: 0,
    });
    action(room, {
      action: 'join_room',
      code: 'READY',
      playerId: 'ready-guest',
      playerName: 'Guest',
      avatar: '🐙',
      color: '#FF2A85',
    });
    expect(() => action(room, { action: 'start_game', code: 'READY', playerId: 'ready-host' })).toThrow(/tap Ready/);
    let current = action(room, { action: 'toggle_ready', code: 'READY', playerId: 'ready-guest' });
    current = action(current, { action: 'start_game', code: 'READY', playerId: 'ready-host' });
    expect(current.phase).toBe('category_select');
    expect(() => action(current, { action: 'next_phase', code: 'READY', playerId: 'ready-guest' })).toThrow(/Only the host/);
  });
});
