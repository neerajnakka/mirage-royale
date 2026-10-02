import { PlayerStats } from './types';

export interface MiragePersona {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  evidence: string;
}

/** A playful, match-only archetype derived from the player's actual round stats. */
export function deriveMiragePersona(stats: PlayerStats): MiragePersona {
  const candidates: Array<{ score: number; tieBreak: number; persona: MiragePersona }> = [
    {
      score: stats.playersFooled * 1.35 + stats.kudosReceived * 0.2,
      tieBreak: 0,
      persona: {
        id: 'ruse-architect',
        title: 'Ruse Architect',
        icon: '🦊',
        tagline: 'You made fiction feel inevitable.',
        evidence: `${stats.playersFooled} rival${stats.playersFooled === 1 ? '' : 's'} fooled`,
      },
    },
    {
      score: stats.truthsFound * 1.15 + Math.max(0, stats.bestStreak - 1) * 0.7,
      tieBreak: 1,
      persona: {
        id: 'signal-sniper',
        title: 'Signal Sniper',
        icon: '🔮',
        tagline: 'You read truth through the static.',
        evidence: `${stats.truthsFound} truth${stats.truthsFound === 1 ? '' : 's'} spotted · best streak ${stats.bestStreak}`,
      },
    },
    {
      score: stats.wagerPointsEarned / 900,
      tieBreak: 2,
      persona: {
        id: 'fortune-engine',
        title: 'Fortune Engine',
        icon: '💎',
        tagline: 'You turned conviction into a high-voltage payout.',
        evidence: `${stats.wagerPointsEarned.toLocaleString()} wager points earned`,
      },
    },
    {
      score: stats.kudosReceived * 1.25,
      tieBreak: 3,
      persona: {
        id: 'golden-tongue',
        title: 'Golden Tongue',
        icon: '🔥',
        tagline: 'The room applauded your lies—and remembered them.',
        evidence: `${stats.kudosReceived} Golden Lie stamp${stats.kudosReceived === 1 ? '' : 's'} received`,
      },
    },
    {
      score: stats.timesFooled * 1.05,
      tieBreak: 4,
      persona: {
        id: 'beautifully-baited',
        title: 'Beautifully Baited',
        icon: '🪤',
        tagline: 'You followed the red herrings with spectacular commitment.',
        evidence: `${stats.timesFooled} red herring${stats.timesFooled === 1 ? '' : 's'} chased`,
      },
    },
  ];

  const strongest = candidates
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.tieBreak - b.tieBreak)[0];

  return strongest?.persona ?? {
    id: 'wild-card',
    title: 'Wild Card',
    icon: '🃏',
    tagline: 'Your pattern is still classified. Queue another match to reveal it.',
    evidence: 'A fresh dossier awaits',
  };
}
