import { describe, expect, it } from 'vitest';
import { deriveMiragePersona } from '../src/lib/persona';
import { PlayerStats } from '../src/lib/types';

const zeroStats: PlayerStats = {
  truthsFound: 0,
  playersFooled: 0,
  timesFooled: 0,
  kudosReceived: 0,
  wagerPointsEarned: 0,
  currentStreak: 0,
  bestStreak: 0,
};

describe('match-only Mirage signature', () => {
  it('rewards the clearest deception pattern', () => {
    expect(deriveMiragePersona({ ...zeroStats, playersFooled: 3 }).id).toBe('ruse-architect');
  });

  it('recognizes precise truth streaks and risk-weighted payouts', () => {
    expect(deriveMiragePersona({ ...zeroStats, truthsFound: 3, bestStreak: 3 }).id).toBe('signal-sniper');
    expect(deriveMiragePersona({ ...zeroStats, wagerPointsEarned: 2700 }).id).toBe('fortune-engine');
  });

  it('has a deterministic, friendly fallback when no match signal stands out', () => {
    expect(deriveMiragePersona(zeroStats)).toMatchObject({
      id: 'wild-card',
      title: 'Wild Card',
      evidence: 'A fresh dossier awaits',
    });
  });
});
