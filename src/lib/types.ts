export type GamePhase =
  | 'lobby'
  | 'category_select'
  | 'write_bluff'
  | 'vote_truth'
  | 'round_reveal'
  | 'game_over';

export type GambitType = 'truth_radar' | 'double_agent' | 'shield_bet';

export type WagerMultiplier = 1 | 2 | 3;

export interface PlayerGambits {
  truth_radar: boolean;
  double_agent: boolean;
  shield_bet: boolean;
}

export interface PlayerStats {
  truthsFound: number;
  playersFooled: number;
  timesFooled: number;
  kudosReceived: number;
  wagerPointsEarned: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  score: number;
  lastRoundDelta: number;
  gambits: PlayerGambits;
  activeGambit: GambitType | null;
  eliminatedOptionId: string | null;
  stats: PlayerStats;
  joinedAt: number;
  lastSeenAt: number;
  /** Server-only hash. Never included in a public room response. */
  sessionTokenHash?: string;
}

export interface TriviaSource {
  label: string;
  url: string;
}

export interface TriviaPrompt {
  id: string;
  category: string;
  categoryIcon: string;
  question: string;
  truth: string;
  acceptedTruthSynonyms: string[];
  houseDecoys: string[];
  factoid: string;
  difficulty: 'Standard' | 'Devious' | 'Mind-Bender';
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  votes: string[];
}

export interface BluffSubmission {
  playerId: string;
  text: string;
  wager: WagerMultiplier;
  gambitUsed: GambitType | null;
  submittedAt: number;
}

export interface LineupOption {
  id: string;
  text: string;
  isTruth: boolean;
  authorIds: string[];
  isHouseDecoy: boolean;
  voterIds: string[];
  kudosVoterIds: string[];
}

export interface RoundScoreBreakdown {
  playerId: string;
  playerName: string;
  avatar: string;
  color: string;
  truthPoints: number;
  wagerPenalty: number;
  fooledPoints: number;
  streakBonus: number;
  kudosBonus: number;
  shieldBonus: number;
  totalDelta: number;
  wagerUsed: WagerMultiplier;
  gambitUsed: GambitType | null;
  foundTruth: boolean;
  fooledPlayerNames: string[];
  fooledByAuthorName: string | null;
}

export interface RoundHistoryItem {
  roundNumber: number;
  category: string;
  question: string;
  truth: string;
  factoid: string;
  lineup: LineupOption[];
  breakdowns: RoundScoreBreakdown[];
}

export interface LiveReaction {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  emoji: string;
  createdAt: number;
}

export interface ActivityEvent {
  id: string;
  text: string;
  type: 'join' | 'lock' | 'gambit' | 'streak' | 'system';
  timestamp: number;
}

export interface MatchAward {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  winnerId: string;
  winnerName: string;
  winnerAvatar: string;
  winnerColor: string;
  statLabel: string;
}

export interface RoomSettings {
  totalRounds: number;
  roundTimerSeconds: number;
  allowHouseDecoys: boolean;
}

export interface RoomState {
  code: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  phase: GamePhase;
  roundNumber: number;
  totalRounds: number;
  phaseStartedAt: number;
  phaseEndsAt: number | null;
  settings: RoomSettings;
  players: Player[];
  usedPromptIds: string[];
  categoryOptions: CategoryOption[];
  selectedCategory: string | null;
  currentPrompt: TriviaPrompt | null;
  submissions: Record<string, BluffSubmission>;
  lineup: LineupOption[];
  votes: Record<string, string>;
  kudosVotes: Record<string, string>;
  revealStep: number;
  lastRoundBreakdowns: RoundScoreBreakdown[];
  history: RoundHistoryItem[];
  reactions: LiveReaction[];
  activityFeed: ActivityEvent[];
  awards: MatchAward[];
}

export type GameActionPayload = (
  | { action: 'create_room'; hostName: string; avatar: string; color: string; timerSeconds?: number }
  | { action: 'join_room'; code: string; playerName: string; avatar: string; color: string; playerId?: string }
  | { action: 'get_room'; code: string; playerId?: string }
  | { action: 'toggle_ready'; code: string; playerId: string }
  | { action: 'update_settings'; code: string; playerId: string; timerSeconds: number; totalRounds?: number }
  | { action: 'add_bot'; code: string; hostId: string }
  | { action: 'remove_player'; code: string; hostId: string; targetPlayerId: string }
  | { action: 'start_game'; code: string; playerId: string }
  | { action: 'vote_category'; code: string; playerId: string; categoryId: string }
  | { action: 'submit_bluff'; code: string; playerId: string; text: string; wager: WagerMultiplier; gambit: GambitType | null }
  | { action: 'use_truth_radar'; code: string; playerId: string }
  | { action: 'submit_vote'; code: string; playerId: string; optionId: string }
  | { action: 'toggle_kudos'; code: string; playerId: string; optionId: string }
  | { action: 'advance_reveal_step'; code: string; playerId: string }
  | { action: 'next_phase'; code: string; playerId: string; expectedPhase?: GamePhase; expectedPhaseStartedAt?: number }
  | { action: 'send_reaction'; code: string; playerId: string; emoji: string }
  | { action: 'restart_game'; code: string; playerId: string }
) & { sessionToken?: string };

export interface StoredGameResponse {
  room: RoomState;
  playerId?: string;
  sessionToken?: string;
}
