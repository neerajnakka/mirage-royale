import {
  ActivityEvent,
  CategoryOption,
  GameActionPayload,
  GambitType,
  LineupOption,
  MatchAward,
  Player,
  RoomState,
  RoundScoreBreakdown,
  TriviaPrompt,
  WagerMultiplier,
} from './types';
import {
  BOT_NAMES,
  CATEGORIES,
  PLAYER_AVATARS,
  PLAYER_COLORS,
  TRIVIA_PROMPTS,
} from './prompts';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(seed?: number): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    const r = seed !== undefined
      ? Math.abs(Math.sin(seed + i * 99) * 10000) % 1
      : Math.random();
    code += ROOM_CODE_CHARS[Math.floor(r * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(a|an|the|of|in|on|to|with)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isTooCloseToTruth(input: string, prompt: TriviaPrompt): boolean {
  const normInput = normalizeText(input);
  if (!normInput) return false;

  const candidates = [prompt.truth, ...prompt.acceptedTruthSynonyms].map(normalizeText);
  for (const cand of candidates) {
    if (!cand) continue;
    if (normInput === cand) return true;
    // Also check if input contains the entire truth synonym and is nearly identical in length
    if (cand.length >= 4 && normInput.includes(cand) && normInput.length <= cand.length + 6) {
      return true;
    }
    if (normInput.length >= 5 && cand.includes(normInput) && cand.length <= normInput.length + 5) {
      return true;
    }
  }
  return false;
}

function addActivity(
  room: RoomState,
  text: string,
  type: ActivityEvent['type'] = 'system'
) {
  const event: ActivityEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    type,
    timestamp: Date.now(),
  };
  room.activityFeed = [event, ...room.activityFeed].slice(0, 18);
}

function createInitialPlayer(params: {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isBot?: boolean;
}): Player {
  const now = Date.now();
  return {
    id: params.id,
    name: params.name.trim().slice(0, 18) || 'Player',
    avatar: params.avatar || PLAYER_AVATARS[0],
    color: params.color || PLAYER_COLORS[0],
    isHost: params.isHost,
    isReady: params.isHost || Boolean(params.isBot),
    isBot: Boolean(params.isBot),
    score: 0,
    lastRoundDelta: 0,
    gambits: {
      truth_radar: true,
      double_agent: true,
      shield_bet: true,
    },
    activeGambit: null,
    eliminatedOptionId: null,
    stats: {
      truthsFound: 0,
      playersFooled: 0,
      timesFooled: 0,
      kudosReceived: 0,
      wagerPointsEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
    joinedAt: now,
    lastSeenAt: now,
  };
}

export function createRoomState(params: {
  code?: string;
  hostId?: string;
  hostName: string;
  avatar: string;
  color: string;
  timerSeconds?: number;
}): { room: RoomState; playerId: string } {
  const now = Date.now();
  const code = (params.code || generateRoomCode()).toUpperCase();
  const hostId = params.hostId || `p-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const host = createInitialPlayer({
    id: hostId,
    name: params.hostName,
    avatar: params.avatar,
    color: params.color,
    isHost: true,
  });

  const room: RoomState = {
    code,
    version: 1,
    createdAt: now,
    updatedAt: now,
    phase: 'lobby',
    roundNumber: 0,
    totalRounds: 3,
    phaseStartedAt: now,
    phaseEndsAt: null,
    settings: {
      totalRounds: 3,
      roundTimerSeconds: params.timerSeconds ?? 60,
      allowHouseDecoys: true,
    },
    players: [host],
    usedPromptIds: [],
    categoryOptions: [],
    selectedCategory: null,
    currentPrompt: null,
    submissions: {},
    lineup: [],
    votes: {},
    kudosVotes: {},
    revealStep: 0,
    lastRoundBreakdowns: [],
    history: [],
    reactions: [],
    activityFeed: [
      {
        id: `act-${now}`,
        text: `${host.name} opened the Mirage Arena (${code})`,
        type: 'join',
        timestamp: now,
      },
    ],
    awards: [],
  };

  return { room, playerId: hostId };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawCategoryOptions(usedPromptIds: string[]): CategoryOption[] {
  const availableCategories = CATEGORIES.filter((cat) =>
    TRIVIA_PROMPTS.some((p) => p.category === cat.id && !usedPromptIds.includes(p.id))
  );
  const pool = availableCategories.length >= 3 ? availableCategories : CATEGORIES;
  const shuffled = shuffle(pool);
  return shuffled.slice(0, 3).map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    tagline: cat.tagline,
    votes: [],
  }));
}

function selectPromptForCategory(categoryName: string, usedPromptIds: string[]): TriviaPrompt {
  const inCat = TRIVIA_PROMPTS.filter(
    (p) => p.category === categoryName && !usedPromptIds.includes(p.id)
  );
  if (inCat.length > 0) {
    return inCat[Math.floor(Math.random() * inCat.length)];
  }
  const anyUnused = TRIVIA_PROMPTS.filter((p) => !usedPromptIds.includes(p.id));
  if (anyUnused.length > 0) {
    return anyUnused[Math.floor(Math.random() * anyUnused.length)];
  }
  return TRIVIA_PROMPTS[Math.floor(Math.random() * TRIVIA_PROMPTS.length)];
}

function runBotActionsForPhase(room: RoomState) {
  const bots = room.players.filter((p) => p.isBot);
  if (bots.length === 0) return;

  if (room.phase === 'category_select' && room.categoryOptions.length > 0) {
    for (const bot of bots) {
      const alreadyVoted = room.categoryOptions.some((c) => c.votes.includes(bot.id));
      if (!alreadyVoted) {
        const pick = room.categoryOptions[Math.floor(Math.random() * room.categoryOptions.length)];
        pick.votes.push(bot.id);
      }
    }
  } else if (room.phase === 'write_bluff' && room.currentPrompt) {
    const prompt = room.currentPrompt;
    const usedTexts = new Set<string>(
      Object.values(room.submissions).map((s) => normalizeText(s.text))
    );
    bots.forEach((bot, idx) => {
      if (!room.submissions[bot.id]) {
        const availableDecoys = prompt.houseDecoys.filter(
          (d) => !usedTexts.has(normalizeText(d))
        );
        const chosenText =
          availableDecoys[idx % Math.max(1, availableDecoys.length)] ||
          `${prompt.houseDecoys[0]} (classified)`;
        usedTexts.add(normalizeText(chosenText));
        const wagers: WagerMultiplier[] = [1, 2, 3];
        const wager = wagers[Math.floor(Math.random() * wagers.length)];
        room.submissions[bot.id] = {
          playerId: bot.id,
          text: chosenText,
          wager,
          gambitUsed: null,
          submittedAt: Date.now(),
        };
      }
    });
  } else if (room.phase === 'vote_truth' && room.lineup.length > 0) {
    for (const bot of bots) {
      if (!room.votes[bot.id]) {
        const eligible = room.lineup.filter((opt) => !opt.authorIds.includes(bot.id));
        if (eligible.length > 0) {
          const pick = eligible[Math.floor(Math.random() * eligible.length)];
          room.votes[bot.id] = pick.id;
          if (!pick.voterIds.includes(bot.id)) {
            pick.voterIds.push(bot.id);
          }
        }
      }
    }
  }
}

function beginRoundCategorySelect(room: RoomState) {
  const now = Date.now();
  room.roundNumber += 1;
  room.phase = 'category_select';
  room.phaseStartedAt = now;
  room.phaseEndsAt =
    room.settings.roundTimerSeconds > 0
      ? now + Math.min(30, room.settings.roundTimerSeconds) * 1000
      : null;
  room.categoryOptions = drawCategoryOptions(room.usedPromptIds);
  room.selectedCategory = null;
  room.currentPrompt = null;
  room.submissions = {};
  room.lineup = [];
  room.votes = {};
  room.kudosVotes = {};
  room.revealStep = 0;
  room.lastRoundBreakdowns = [];

  for (const p of room.players) {
    p.activeGambit = null;
    p.eliminatedOptionId = null;
  }

  addActivity(
    room,
    `Round ${room.roundNumber} of ${room.totalRounds} initiated — Vote for a dossier category!`,
    'system'
  );
  runBotActionsForPhase(room);
}

function finalizeCategoryAndStartBluff(room: RoomState, forcedCategoryId?: string) {
  const now = Date.now();
  let winningCat = room.categoryOptions[0];
  if (forcedCategoryId) {
    const found = room.categoryOptions.find((c) => c.id === forcedCategoryId);
    if (found) winningCat = found;
  } else {
    const maxVotes = Math.max(...room.categoryOptions.map((c) => c.votes.length), 0);
    const tied = room.categoryOptions.filter((c) => c.votes.length === maxVotes);
    if (tied.length > 0) winningCat = tied[Math.floor(Math.random() * tied.length)];
  }

  const categoryName = winningCat ? winningCat.id : CATEGORIES[0].id;
  const prompt = selectPromptForCategory(categoryName, room.usedPromptIds);

  room.selectedCategory = categoryName;
  room.currentPrompt = prompt;
  room.usedPromptIds.push(prompt.id);
  room.phase = 'write_bluff';
  room.phaseStartedAt = now;
  room.phaseEndsAt =
    room.settings.roundTimerSeconds > 0
      ? now + room.settings.roundTimerSeconds * 1000
      : null;

  addActivity(room, `Dossier locked: ${categoryName}! Craft your forgery.`, 'system');
  runBotActionsForPhase(room);
}

export function buildLineupForRoom(room: RoomState) {
  if (!room.currentPrompt) return;
  const prompt = room.currentPrompt;
  const optionsMap = new Map<string, LineupOption>();

  // 1. Add player submissions (merge identical normalized bluffs)
  for (const sub of Object.values(room.submissions)) {
    const norm = normalizeText(sub.text);
    if (!norm) continue;
    const existing = optionsMap.get(norm);
    if (existing) {
      if (!existing.authorIds.includes(sub.playerId)) {
        existing.authorIds.push(sub.playerId);
      }
    } else {
      optionsMap.set(norm, {
        id: `opt-${Math.random().toString(36).slice(2, 11)}`,
        text: sub.text.trim(),
        isTruth: false,
        authorIds: [sub.playerId],
        isHouseDecoy: false,
        voterIds: [],
        kudosVoterIds: [],
      });
    }
  }

  // 2. Add the Real Truth
  const truthNorm = normalizeText(prompt.truth);
  optionsMap.set(`__truth__${truthNorm}`, {
    id: `opt-${Math.random().toString(36).slice(2, 11)}`,
    text: prompt.truth,
    isTruth: true,
    authorIds: [],
    isHouseDecoy: false,
    voterIds: [],
    kudosVoterIds: [],
  });

  // 3. Add House Decoys if total options < 4 so 2-player games still have a rich 4-card spread
  let decoyIdx = 0;
  while (optionsMap.size < 4 && decoyIdx < prompt.houseDecoys.length) {
    const decoyText = prompt.houseDecoys[decoyIdx];
    const norm = normalizeText(decoyText);
    if (!optionsMap.has(norm) && norm !== truthNorm) {
      optionsMap.set(norm, {
        id: `opt-${Math.random().toString(36).slice(2, 11)}`,
        text: decoyText,
        isTruth: false,
        authorIds: [],
        isHouseDecoy: true,
        voterIds: [],
        kudosVoterIds: [],
      });
    }
    decoyIdx++;
  }

  // Shuffle options
  const allOptions = Array.from(optionsMap.values());
  for (let i = allOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
  }

  room.lineup = allOptions;
  const now = Date.now();
  room.phase = 'vote_truth';
  room.phaseStartedAt = now;
  room.phaseEndsAt =
    room.settings.roundTimerSeconds > 0
      ? now + Math.max(30, Math.floor(room.settings.roundTimerSeconds * 0.75)) * 1000
      : null;

  addActivity(
    room,
    `All forgeries on the table! Spot the real truth among ${allOptions.length} suspects.`,
    'system'
  );
  runBotActionsForPhase(room);
}

export function resolveRoundScores(room: RoomState) {
  const isFinaleRound = room.roundNumber >= room.totalRounds;
  const baseTruthPoints = isFinaleRound ? 1000 : 500;
  const baseFoolPoints = 400;
  const streakBonusAmount = 250;
  const kudosBonusAmount = 150;
  const shieldBonusAmount = 200;

  const breakdownsMap = new Map<string, RoundScoreBreakdown>();

  for (const player of room.players) {
    const sub = room.submissions[player.id];
    breakdownsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      color: player.color,
      truthPoints: 0,
      wagerPenalty: 0,
      fooledPoints: 0,
      streakBonus: 0,
      kudosBonus: 0,
      shieldBonus: 0,
      totalDelta: 0,
      wagerUsed: sub?.wager || 1,
      gambitUsed: sub?.gambitUsed || player.activeGambit || null,
      foundTruth: false,
      fooledPlayerNames: [],
      fooledByAuthorName: null,
    });
  }

  // 1. Evaluate votes for Truth vs Bluffs
  for (const voter of room.players) {
    const votedOptionId = room.votes[voter.id];
    const voterBreakdown = breakdownsMap.get(voter.id)!;
    const votedOption = room.lineup.find((o) => o.id === votedOptionId);

    if (votedOption && votedOption.isTruth) {
      voterBreakdown.foundTruth = true;
      const wager = voterBreakdown.wagerUsed;
      const pts = baseTruthPoints * wager;
      voterBreakdown.truthPoints = pts;
      voter.stats.truthsFound += 1;
      voter.stats.wagerPointsEarned += pts;
      voter.stats.currentStreak += 1;
      if (voter.stats.currentStreak > voter.stats.bestStreak) {
        voter.stats.bestStreak = voter.stats.currentStreak;
      }
      if (voter.stats.currentStreak >= 2) {
        voterBreakdown.streakBonus = streakBonusAmount;
      }
    } else if (votedOption) {
      // A wrong, locked verdict has a real wager downside; a timeout/no verdict does not.
      voter.stats.timesFooled += 1;
      if (voterBreakdown.gambitUsed === 'shield_bet') {
        // Aegis absorbs the wager penalty, preserves streak, and pays modest insurance.
        voterBreakdown.shieldBonus = shieldBonusAmount;
      } else {
        voter.stats.currentStreak = 0;
        voterBreakdown.wagerPenalty =
          voterBreakdown.wagerUsed === 3 ? 500 : voterBreakdown.wagerUsed === 2 ? 250 : 0;
      }

      if (votedOption.authorIds.length > 0) {
        const authorNames: string[] = [];
        for (const authorId of votedOption.authorIds) {
          if (authorId === voter.id) continue;
          const author = room.players.find((p) => p.id === authorId);
          const authorBreakdown = breakdownsMap.get(authorId);
          if (author && authorBreakdown) {
            authorNames.push(author.name);
            const isDoubleAgent = authorBreakdown.gambitUsed === 'double_agent';
            const foolPts = isDoubleAgent ? baseFoolPoints * 2 : baseFoolPoints;
            authorBreakdown.fooledPoints += foolPts;
            authorBreakdown.fooledPlayerNames.push(voter.name);
            author.stats.playersFooled += 1;
          }
        }
        voterBreakdown.fooledByAuthorName = authorNames.join(' & ') || 'House Decoy';
      } else if (votedOption.isHouseDecoy) {
        voterBreakdown.fooledByAuthorName = 'House Decoy';
      }
    } else {
      // A missing verdict breaks the streak, but is not counted as a wrong wager.
      voter.stats.currentStreak = 0;
    }
  }

  // 2. Evaluate Kudos ("Golden Lie" stamps)
  for (const option of room.lineup) {
    if (option.kudosVoterIds.length > 0 && option.authorIds.length > 0) {
      for (const authorId of option.authorIds) {
        const author = room.players.find((p) => p.id === authorId);
        const authorBreakdown = breakdownsMap.get(authorId);
        if (author && authorBreakdown) {
          const validKudosCount = option.kudosVoterIds.filter((id) => id !== authorId).length;
          const kPts = validKudosCount * kudosBonusAmount;
          authorBreakdown.kudosBonus += kPts;
          author.stats.kudosReceived += validKudosCount;
        }
      }
    }
  }

  // 3. Apply total deltas to players
  const breakdowns: RoundScoreBreakdown[] = [];
  for (const player of room.players) {
    const b = breakdownsMap.get(player.id)!;
    b.totalDelta =
      b.truthPoints - b.wagerPenalty + b.fooledPoints + b.streakBonus + b.kudosBonus + b.shieldBonus;
    player.lastRoundDelta = b.totalDelta;
    player.score += b.totalDelta;
    breakdowns.push(b);
  }

  breakdowns.sort((a, b) => b.totalDelta - a.totalDelta);
  room.lastRoundBreakdowns = breakdowns;
  room.revealStep = 0;

  if (room.currentPrompt) {
    room.history.push({
      roundNumber: room.roundNumber,
      category: room.selectedCategory || room.currentPrompt.category,
      question: room.currentPrompt.question,
      truth: room.currentPrompt.truth,
      factoid: room.currentPrompt.factoid,
      lineup: JSON.parse(JSON.stringify(room.lineup)),
      breakdowns: JSON.parse(JSON.stringify(breakdowns)),
    });
  }

  const now = Date.now();
  room.phase = 'round_reveal';
  room.phaseStartedAt = now;
  room.phaseEndsAt = null;

  addActivity(room, `Round ${room.roundNumber} dossiers declassified!`, 'system');
}

export function computeMatchAwards(room: RoomState): MatchAward[] {
  if (room.players.length === 0) return [];
  const awards: MatchAward[] = [];

  // 1. The Puppetmaster (Most Players Fooled)
  const byFooled = [...room.players].sort(
    (a, b) => b.stats.playersFooled - a.stats.playersFooled || b.score - a.score
  );
  if (byFooled[0]) {
    awards.push({
      id: 'award-puppetmaster',
      title: 'The Puppetmaster',
      subtitle: 'Master of Forgery & Deception',
      icon: '🦊',
      winnerId: byFooled[0].id,
      winnerName: byFooled[0].name,
      winnerAvatar: byFooled[0].avatar,
      winnerColor: byFooled[0].color,
      statLabel: `${byFooled[0].stats.playersFooled} Rival${byFooled[0].stats.playersFooled === 1 ? '' : 's'} Fooled`,
    });
  }

  // 2. The Oracle (Most Truths Found)
  const byTruths = [...room.players].sort(
    (a, b) => b.stats.truthsFound - a.stats.truthsFound || b.score - a.score
  );
  if (byTruths[0]) {
    awards.push({
      id: 'award-oracle',
      title: 'The Grand Oracle',
      subtitle: 'Unshakeable Truth Detector',
      icon: '🔮',
      winnerId: byTruths[0].id,
      winnerName: byTruths[0].name,
      winnerAvatar: byTruths[0].avatar,
      winnerColor: byTruths[0].color,
      statLabel: `${byTruths[0].stats.truthsFound}/${room.totalRounds} Truths Spotted`,
    });
  }

  // 3. High Roller (Most Wager Points Earned)
  const byWager = [...room.players].sort(
    (a, b) => b.stats.wagerPointsEarned - a.stats.wagerPointsEarned || b.score - a.score
  );
  if (byWager[0]) {
    awards.push({
      id: 'award-highroller',
      title: 'High-Stakes Maverick',
      subtitle: 'Boldest Wager Multiplier Payoffs',
      icon: '💎',
      winnerId: byWager[0].id,
      winnerName: byWager[0].name,
      winnerAvatar: byWager[0].avatar,
      winnerColor: byWager[0].color,
      statLabel: `${byWager[0].stats.wagerPointsEarned.toLocaleString()} Wager Pts`,
    });
  }

  // 4. Crowd Favorite (Most Kudos Received)
  const byKudos = [...room.players].sort(
    (a, b) => b.stats.kudosReceived - a.stats.kudosReceived || b.score - a.score
  );
  if (byKudos[0]) {
    awards.push({
      id: 'award-comedian',
      title: 'Golden Tongue',
      subtitle: 'Most Applauded Forgeries',
      icon: '🔥',
      winnerId: byKudos[0].id,
      winnerName: byKudos[0].name,
      winnerAvatar: byKudos[0].avatar,
      winnerColor: byKudos[0].color,
      statLabel: `${byKudos[0].stats.kudosReceived} Kudos Stamp${byKudos[0].stats.kudosReceived === 1 ? '' : 's'}`,
    });
  }

  return awards;
}

export function applyGameAction(
  room: RoomState,
  payload: GameActionPayload
): { room: RoomState; playerId?: string; meta?: Record<string, unknown> } {
  const now = Date.now();
  room.updatedAt = now;
  room.version += 1;

  // Touch player's lastSeenAt if playerId is present
  if ('playerId' in payload && payload.playerId) {
    const p = room.players.find((pl) => pl.id === payload.playerId);
    if (p) p.lastSeenAt = now;
  }

  switch (payload.action) {
    case 'get_room': {
      return { room };
    }

    case 'join_room': {
      const cleanName = payload.playerName.trim().slice(0, 18);
      if (!cleanName) {
        throw new Error('Please enter a display name to join.');
      }

      // Check if reconnecting by playerId or exact case-insensitive name
      let existing = room.players.find(
        (p) =>
          (payload.playerId && p.id === payload.playerId) ||
          p.name.toLowerCase() === cleanName.toLowerCase()
      );

      if (existing) {
        existing.name = cleanName;
        if (payload.avatar) existing.avatar = payload.avatar;
        if (payload.color) existing.color = payload.color;
        existing.lastSeenAt = now;
        return { room, playerId: existing.id };
      }

      if (room.phase !== 'lobby') {
        throw new Error('This match is already in progress. Ask the host for the next room code!');
      }

      if (room.players.length >= 8) {
        throw new Error('This room is full (maximum 8 players).');
      }

      const newPlayerId =
        payload.playerId || `p-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const usedColors = new Set(room.players.map((p) => p.color));
      const assignedColor =
        payload.color && !usedColors.has(payload.color)
          ? payload.color
          : PLAYER_COLORS.find((c) => !usedColors.has(c)) || payload.color || PLAYER_COLORS[0];

      const newPlayer = createInitialPlayer({
        id: newPlayerId,
        name: cleanName,
        avatar: payload.avatar || PLAYER_AVATARS[room.players.length % PLAYER_AVATARS.length],
        color: assignedColor,
        isHost: false,
      });

      room.players.push(newPlayer);
      addActivity(room, `${newPlayer.name} entered the lobby`, 'join');
      return { room, playerId: newPlayerId };
    }

    case 'toggle_ready': {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error('Player not found in room.');
      player.isReady = !player.isReady;
      return { room };
    }

    case 'update_settings': {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error('Only the room host can update match settings.');
      }
      room.settings.roundTimerSeconds = payload.timerSeconds;
      if (payload.totalRounds && payload.totalRounds >= 1 && payload.totalRounds <= 5) {
        room.settings.totalRounds = payload.totalRounds;
        room.totalRounds = payload.totalRounds;
      }
      return { room };
    }

    case 'add_bot': {
      const host = room.players.find((p) => p.id === payload.hostId);
      if (!host || !host.isHost) {
        throw new Error('Only the host can add an AI challenger.');
      }
      if (room.phase !== 'lobby') {
        throw new Error('AI challengers can only be added in the lobby.');
      }
      if (room.players.length >= 8) {
        throw new Error('Maximum 8 players reached.');
      }
      const existingNames = new Set(room.players.map((p) => p.name));
      const botName =
        BOT_NAMES.find((n) => !existingNames.has(n)) || `MirageBot_${room.players.length}`;
      const botId = `bot-${now.toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
      const bot = createInitialPlayer({
        id: botId,
        name: botName,
        avatar: '🤖',
        color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
        isHost: false,
        isBot: true,
      });
      room.players.push(bot);
      addActivity(room, `AI Challenger ${bot.name} joined the table`, 'join');
      return { room };
    }

    case 'remove_player': {
      const host = room.players.find((p) => p.id === payload.hostId);
      if (!host || !host.isHost) {
        throw new Error('Only the host can remove players.');
      }
      if (payload.targetPlayerId === host.id) {
        throw new Error('Host cannot remove themselves.');
      }
      room.players = room.players.filter((p) => p.id !== payload.targetPlayerId);
      return { room };
    }

    case 'start_game': {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error('Only the host can start the game.');
      }
      if (room.players.length < 2) {
        throw new Error('At least 2 players are required to start the match.');
      }
      const notReady = room.players.filter((p) => !p.isReady);
      if (notReady.length > 0) {
        throw new Error(`Waiting for ${notReady.length} player${notReady.length === 1 ? '' : 's'} to tap Ready.`);
      }
      if (room.phase !== 'lobby') {
        return { room };
      }

      room.roundNumber = 0;
      beginRoundCategorySelect(room);
      return { room };
    }

    case 'vote_category': {
      if (room.phase !== 'category_select') {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error('Player not found.');

      for (const cat of room.categoryOptions) {
        cat.votes = cat.votes.filter((id) => id !== player.id);
      }
      const targetCat = room.categoryOptions.find((c) => c.id === payload.categoryId);
      if (!targetCat) throw new Error('Category not found.');
      targetCat.votes.push(player.id);

      const totalVotes = room.categoryOptions.reduce((acc, c) => acc + c.votes.length, 0);
      if (totalVotes >= room.players.length) {
        finalizeCategoryAndStartBluff(room);
      }
      return { room };
    }

    case 'submit_bluff': {
      if (room.phase !== 'write_bluff' || !room.currentPrompt) {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error('Player not found.');

      const trimmed = payload.text.trim().slice(0, 80);
      if (!trimmed) {
        throw new Error('Your bluff cannot be empty!');
      }

      if (isTooCloseToTruth(trimmed, room.currentPrompt)) {
        throw new Error(
          'TRUTH_INTERCEPTED: You typed the actual real answer! Enter a convincing fake answer instead to fool the room.'
        );
      }

      const wager: WagerMultiplier =
        payload.wager === 2 || payload.wager === 3 ? payload.wager : 1;

      let chosenGambit: GambitType | null = null;
      if (payload.gambit === 'double_agent' || payload.gambit === 'shield_bet') {
        if (player.gambits[payload.gambit]) {
          chosenGambit = payload.gambit;
          player.gambits[payload.gambit] = false;
          player.activeGambit = chosenGambit;
        }
      }

      room.submissions[player.id] = {
        playerId: player.id,
        text: trimmed,
        wager,
        gambitUsed: chosenGambit,
        submittedAt: now,
      };

      const wagerLabel = wager === 3 ? '3x ALL-IN' : wager === 2 ? '2x Bold' : '1x Stake';
      addActivity(
        room,
        `${player.name} locked in their forgery (${wagerLabel})${chosenGambit ? ' + Tactical Gambit!' : ''}`,
        chosenGambit ? 'gambit' : 'lock'
      );

      const submittedCount = Object.keys(room.submissions).length;
      if (submittedCount >= room.players.length) {
        buildLineupForRoom(room);
      }

      return { room };
    }

    case 'use_truth_radar': {
      if (room.phase !== 'vote_truth') {
        throw new Error('Truth Radar can only be activated during the Suspect Lineup phase.');
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error('Player not found.');
      if (!player.gambits.truth_radar) {
        throw new Error('You have already used your Truth Radar this match.');
      }
      if (player.eliminatedOptionId) {
        return { room };
      }

      const removableFakes = room.lineup.filter(
        (opt) => !opt.isTruth && !opt.authorIds.includes(player.id)
      );
      if (removableFakes.length === 0) {
        throw new Error('No eligible fake suspects to eliminate.');
      }

      const target = removableFakes[Math.floor(Math.random() * removableFakes.length)];
      player.eliminatedOptionId = target.id;
      player.gambits.truth_radar = false;
      addActivity(room, `${player.name} deployed Truth Radar (private fake filter)!`, 'gambit');
      return { room };
    }

    case 'submit_vote': {
      if (room.phase !== 'vote_truth') {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error('Player not found.');

      const option = room.lineup.find((o) => o.id === payload.optionId);
      if (!option) throw new Error('Selected answer card not found.');

      if (option.authorIds.includes(player.id)) {
        throw new Error("You can't vote for your own forgery!");
      }

      // Clear previous vote if any
      for (const opt of room.lineup) {
        opt.voterIds = opt.voterIds.filter((id) => id !== player.id);
      }

      room.votes[player.id] = option.id;
      option.voterIds.push(player.id);

      addActivity(room, `${player.name} locked in their verdict`, 'lock');

      if (Object.keys(room.votes).length >= room.players.length) {
        resolveRoundScores(room);
      }

      return { room };
    }

    case 'toggle_kudos': {
      if (room.phase !== 'vote_truth' && room.phase !== 'round_reveal') {
        return { room };
      }
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) throw new Error('Player not found.');

      const option = room.lineup.find((o) => o.id === payload.optionId);
      if (!option) throw new Error('Option not found.');
      if (option.authorIds.includes(player.id)) {
        throw new Error("You can't award Kudos to your own bluff!");
      }

      // Remove player's previous kudos
      for (const opt of room.lineup) {
        opt.kudosVoterIds = opt.kudosVoterIds.filter((id) => id !== player.id);
      }

      if (room.kudosVotes[player.id] === option.id) {
        delete room.kudosVotes[player.id];
      } else {
        room.kudosVotes[player.id] = option.id;
        option.kudosVoterIds.push(player.id);
      }
      return { room };
    }

    case 'advance_reveal_step': {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error('Only the host can declassify the next dossier.');
      }
      if (room.phase === 'round_reveal') {
        room.revealStep = Math.min(room.lineup.length, room.revealStep + 1);
      }
      return { room };
    }

    case 'next_phase': {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error('Only the host can advance the match.');
      }

      // Prevent a stale timer/button request from accidentally advancing a later stage.
      if (payload.expectedPhase && payload.expectedPhase !== room.phase) {
        return { room };
      }
      if (
        payload.expectedPhaseStartedAt &&
        payload.expectedPhaseStartedAt !== room.phaseStartedAt
      ) {
        return { room };
      }

      if (room.phase === 'category_select') {
        finalizeCategoryAndStartBluff(room);
      } else if (room.phase === 'write_bluff') {
        buildLineupForRoom(room);
      } else if (room.phase === 'vote_truth') {
        resolveRoundScores(room);
      } else if (room.phase === 'round_reveal') {
        if (room.revealStep < room.lineup.length) {
          throw new Error('Reveal every dossier card before continuing.');
        }
        if (room.roundNumber >= room.totalRounds) {
          room.phase = 'game_over';
          room.phaseStartedAt = now;
          room.phaseEndsAt = null;
          room.awards = computeMatchAwards(room);
          addActivity(room, `Match complete! Behold the Champions of Mirage Royale!`, 'system');
        } else {
          beginRoundCategorySelect(room);
        }
      }
      return { room };
    }

    case 'send_reaction': {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player) return { room };
      const allowedEmojis = ['🔥', '😂', '🧠', '💀', '👀', '👑', '⚡', '👏'];
      const emoji = allowedEmojis.includes(payload.emoji) ? payload.emoji : '🔥';

      const reaction = {
        id: `rx-${now}-${Math.random().toString(36).slice(2, 6)}`,
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        emoji,
        createdAt: now,
      };
      room.reactions = [...room.reactions.filter((r) => now - r.createdAt < 12000), reaction].slice(
        -20
      );
      return { room };
    }

    case 'restart_game': {
      const player = room.players.find((p) => p.id === payload.playerId);
      if (!player || !player.isHost) {
        throw new Error('Only the host can start a rematch.');
      }

      room.roundNumber = 0;
      room.usedPromptIds = [];
      room.history = [];
      room.awards = [];
      room.lastRoundBreakdowns = [];

      for (const p of room.players) {
        p.score = 0;
        p.lastRoundDelta = 0;
        p.activeGambit = null;
        p.eliminatedOptionId = null;
        p.gambits = {
          truth_radar: true,
          double_agent: true,
          shield_bet: true,
        };
        p.stats = {
          truthsFound: 0,
          playersFooled: 0,
          timesFooled: 0,
          kudosReceived: 0,
          wagerPointsEarned: 0,
          currentStreak: 0,
          bestStreak: 0,
        };
      }

      beginRoundCategorySelect(room);
      return { room };
    }

    default:
      return { room };
  }
}
