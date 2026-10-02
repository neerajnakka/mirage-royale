import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Check, Crown, RotateCcw, Share2, Sparkles, Trophy, Medal, Target, Flame } from 'lucide-react';
import { Player, RoomState } from '../lib/types';
import { deriveMiragePersona } from '../lib/persona';
import { sfx } from '../lib/sound';

interface GameOverScreenProps {
  room: RoomState;
  currentPlayer: Player;
  loading: boolean;
  onRestart: () => void;
}

const PODIUM_STYLE = [
  { label: 'CHAMPION', medal: '👑', tone: 'border-amber-300/55 bg-gradient-to-b from-amber-300/15 to-amber-900/10', height: 'min-h-[208px]' },
  { label: 'RUNNER-UP', medal: '🥈', tone: 'border-slate-300/30 bg-gradient-to-b from-slate-300/10 to-slate-900/10', height: 'min-h-[174px]' },
  { label: 'THIRD PLACE', medal: '🥉', tone: 'border-orange-400/30 bg-gradient-to-b from-orange-400/10 to-orange-900/10', height: 'min-h-[150px]' },
];

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  room,
  currentPlayer,
  loading,
  onRestart,
}) => {
  const leaderboard = useMemo(() => [...room.players].sort((a, b) => b.score - a.score), [room.players]);
  const winner = leaderboard[0];
  const tied = Boolean(leaderboard[1] && leaderboard[1].score === winner?.score);
  const persona = useMemo(() => deriveMiragePersona(currentPlayer.stats), [currentPlayer.stats]);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      sfx.playFanfare();
      const end = Date.now() + 1400;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          startVelocity: 45,
          origin: { x: 0.1, y: 0.68 },
          colors: ['#00F2FE', '#FF2A85', '#FFB800', '#00E699'],
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          startVelocity: 45,
          origin: { x: 0.9, y: 0.68 },
          colors: ['#00F2FE', '#FF2A85', '#FFB800', '#00E699'],
          disableForReducedMotion: true,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, []);

  const shareResults = async () => {
    const rank = leaderboard.findIndex((player) => player.id === currentPlayer.id) + 1;
    const summary = [
      'MIRAGE ROYALE · MATCH FILE',
      `${currentPlayer.avatar} ${currentPlayer.name} played as ${persona.title} — ${persona.tagline}`,
      `Final rank: #${rank} · ${currentPlayer.score.toLocaleString()} points`,
      leaderboard.map((player, index) => `${index + 1}. ${player.name}: ${player.score.toLocaleString()} pts`).join(' · '),
    ].join('\n');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(summary);
      setShareStatus('copied');
    } catch {
      // Give a visible explanation instead of silently pretending the copy worked.
      setShareStatus('failed');
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const podiumOrder: Player[] = topThree.length >= 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-300/30 text-amber-100 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> The Mirage Arena has a new legend
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white">
          {tied ? 'A Championship Draw.' : 'The Crown Is Claimed.'}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Three rounds. A room full of believable lies. One final leaderboard.
        </p>
      </div>

      <div className="max-w-4xl mx-auto flex items-end justify-center gap-2 sm:gap-4 px-2">
        {podiumOrder.map((player) => {
          const rank = leaderboard.findIndex((entry) => entry.id === player.id);
          const style = PODIUM_STYLE[rank];
          return (
            <div key={player.id} className={`relative flex-1 max-w-[250px] rounded-t-[28px] rounded-b-2xl border ${style.tone} ${style.height} p-4 sm:p-6 flex flex-col items-center justify-end text-center overflow-hidden`}>
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />
              <div className="relative text-3xl sm:text-4xl">{player.avatar}</div>
              <div className="relative text-[9px] sm:text-[10px] font-mono uppercase tracking-widest mt-2 text-amber-100/80">{style.label}</div>
              <div className="relative font-display font-extrabold text-sm sm:text-lg text-white mt-1 truncate max-w-full" style={{ color: player.color }}>{player.name}</div>
              <div className="relative font-mono font-black text-lg sm:text-2xl text-white mt-1">{player.score.toLocaleString()}</div>
              <div className="relative text-[10px] text-slate-400">points</div>
              <div className="absolute top-3 right-3 text-lg">{style.medal}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 rounded-3xl border border-white/12 bg-[#0D1124]/90 p-5 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Final classification</div>
              <h2 className="font-display font-bold text-xl text-white mt-1">Complete leaderboard</h2>
            </div>
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <div key={player.id} className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl border ${index === 0 ? 'bg-amber-400/[0.07] border-amber-300/30' : 'bg-white/[0.035] border-white/[0.06]'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 font-mono font-bold ${index === 0 ? 'text-amber-200' : 'text-slate-500'}`}>#{index + 1}</span>
                  <span className="text-xl">{player.avatar}</span>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm truncate" style={{ color: player.color }}>{player.name}{player.id === currentPlayer.id ? ' · YOU' : ''}</div>
                    <div className="text-[10px] text-slate-500">{player.stats.playersFooled} fooled · {player.stats.truthsFound} truths · {player.stats.bestStreak} best streak</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-extrabold text-white">{player.score.toLocaleString()}</div>
                  <div className={`text-[10px] font-mono ${player.lastRoundDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{player.lastRoundDelta > 0 ? '+' : ''}{player.lastRoundDelta.toLocaleString()} final round</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/12 bg-[#0D1124]/90 p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-fuchsia-300" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Match honors</div>
                <h2 className="font-display font-bold text-lg text-white">Awards beyond the crown</h2>
              </div>
            </div>
            <div className="space-y-2.5">
              {room.awards.map((award) => (
                <div key={award.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-400/20 flex items-center justify-center text-xl">{award.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-fuchsia-200">{award.title}</div>
                    <div className="text-xs font-bold text-white truncate">{award.winnerAvatar} {award.winnerName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{award.statLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden p-5 rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/[0.12] via-fuchsia-500/[0.08] to-amber-500/[0.12]">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-fuchsia-400/[0.08] blur-2xl" aria-hidden="true" />
            <div className="relative flex items-start gap-3.5">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(0,242,254,0.12)]">
                {persona.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-cyan-200/75">Post-match readout · this match only</div>
                <h2 className="font-display font-extrabold text-lg text-white mt-1">Your Mirage Signature</h2>
                <div className="font-mono text-xs uppercase tracking-widest text-amber-200 mt-2">{persona.title}</div>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">{persona.tagline}</p>
                <div className="inline-flex mt-3 px-2.5 py-1 rounded-full bg-black/25 border border-white/[0.08] text-[10px] text-cyan-100/90">{persona.evidence}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-amber-500/10 border border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-white"><Flame className="w-4 h-4 text-orange-300" /> Round recap</div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {room.history.map((round) => (
                <div key={round.roundNumber} className="p-2 rounded-xl bg-black/20 border border-white/[0.06] text-center">
                  <div className="text-[9px] font-mono uppercase text-slate-500">Round {round.roundNumber}</div>
                  <div className="text-[10px] font-semibold text-slate-200 mt-1 truncate">{round.category}</div>
                  <div className="text-[9px] text-emerald-200 mt-1 truncate">Truth: {round.truth}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => { sfx.playClick(); void shareResults(); }}
          aria-live="polite"
          className="min-h-12 flex-1 inline-flex items-center justify-center gap-2 px-5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.13] border border-white/15 text-white font-semibold text-sm transition"
        >
          {shareStatus === 'copied' ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className={`w-4 h-4 ${shareStatus === 'failed' ? 'text-amber-300' : 'text-cyan-300'}`} />}
          {shareStatus === 'copied' ? 'Copied to clipboard' : shareStatus === 'failed' ? 'Clipboard unavailable' : 'Copy results'}
        </button>
        <button
          type="button"
          disabled={!currentPlayer.isHost || loading}
          onClick={() => { sfx.playFanfare(); onRestart(); }}
          className="min-h-12 flex-1 inline-flex items-center justify-center gap-2 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 text-slate-950 font-display font-extrabold text-sm transition hover:brightness-110 disabled:opacity-45"
        >
          <RotateCcw className="w-4 h-4" />
          {currentPlayer.isHost ? 'Play a rematch' : 'Rematch with same crew'}
        </button>
      </div>
      {!currentPlayer.isHost && <p className="text-center text-[11px] text-slate-500">The host controls the rematch. Your room and player stats will reset for a fresh match.</p>}
    </div>
  );
};
