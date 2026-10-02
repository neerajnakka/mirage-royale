import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Bot,
  Check,
  Clock3,
  FastForward,
  Flame,
  LockKeyhole,
  Shield,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { GambitType, Player, RoomState, WagerMultiplier } from '../lib/types';
import { sfx } from '../lib/sound';

interface BluffStageProps {
  room: RoomState;
  currentPlayer: Player;
  loading: boolean;
  error: string | null;
  onSubmitBluff: (text: string, wager: WagerMultiplier, gambit: GambitType | null) => void;
  onForceNextPhase: () => void;
}

const WAGERS: Array<{
  value: WagerMultiplier;
  title: string;
  payout: string;
  risk: string;
  tone: string;
}> = [
  { value: 1, title: 'SAFE', payout: '+500', risk: 'No miss penalty', tone: 'cyan' },
  { value: 2, title: 'BOLD', payout: '+1,000', risk: '−250 if wrong', tone: 'fuchsia' },
  { value: 3, title: 'ALL-IN', payout: '+1,500', risk: '−500 if wrong', tone: 'amber' },
];

const toneStyles: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  cyan: {
    border: 'border-cyan-400/70',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-200',
    glow: 'shadow-[0_0_24px_rgba(0,242,254,0.15)]',
  },
  fuchsia: {
    border: 'border-fuchsia-400/70',
    bg: 'bg-fuchsia-500/15',
    text: 'text-fuchsia-200',
    glow: 'shadow-[0_0_24px_rgba(255,42,133,0.16)]',
  },
  amber: {
    border: 'border-amber-400/70',
    bg: 'bg-amber-500/15',
    text: 'text-amber-200',
    glow: 'shadow-[0_0_24px_rgba(255,184,0,0.16)]',
  },
};

function PromptText({ question }: { question: string }) {
  const parts = question.split('_____');
  return (
    <p className="font-display text-lg sm:text-2xl leading-relaxed font-semibold text-white">
      {parts.map((part, index) => (
        <React.Fragment key={`${index}-${part.slice(0, 8)}`}>
          {part}
          {index < parts.length - 1 && (
            <span className="inline-block mx-1 px-3 py-0.5 rounded-lg border border-fuchsia-300/50 bg-fuchsia-500/15 text-fuchsia-200 font-mono tracking-[0.18em]">
              _____
            </span>
          )}
        </React.Fragment>
      ))}
    </p>
  );
}

export const BluffStage: React.FC<BluffStageProps> = ({
  room,
  currentPlayer,
  loading,
  error,
  onSubmitBluff,
  onForceNextPhase,
}) => {
  const prompt = room.currentPrompt;
  const ownSubmission = room.submissions[currentPlayer.id];
  const submitted = Boolean(ownSubmission?.text);
  const [text, setText] = useState(ownSubmission?.text || '');
  const [wager, setWager] = useState<WagerMultiplier>(ownSubmission?.wager || 1);
  const [gambit, setGambit] = useState<GambitType | null>(ownSubmission?.gambitUsed || null);
  const submittedIds = useMemo(() => new Set(Object.keys(room.submissions)), [room.submissions]);
  const finale = room.roundNumber === room.totalRounds;

  useEffect(() => {
    if (ownSubmission?.text) {
      setText(ownSubmission.text);
      setWager(ownSubmission.wager);
      setGambit(ownSubmission.gambitUsed);
    }
  }, [ownSubmission?.text, ownSubmission?.wager, ownSubmission?.gambitUsed]);

  if (!prompt) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/30 text-fuchsia-200 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Round {room.roundNumber} / {room.totalRounds} • Stage 2: Forge & Stake</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
          Make the Fake Feel <span className="text-fuchsia-300">Factual.</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Everyone writes at once. Your forged answer joins an anonymous lineup; the most convincing lie earns <strong className="text-amber-200">+400 for each rival it fools.</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="lg:col-span-7 rounded-[28px] border border-white/15 bg-[#0D1124]/90 backdrop-blur-xl p-5 sm:p-7 shadow-[0_0_45px_rgba(255,42,133,0.12)]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono uppercase tracking-wider text-slate-300">
              <span>{prompt.categoryIcon}</span>
              <span>{room.selectedCategory}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-200/80">
              {prompt.difficulty} dossier
            </span>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-black/35 border border-white/10 min-h-[150px] flex items-center">
            <PromptText question={prompt.question} />
          </div>

          {!submitted ? (
            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="bluff-answer" className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Your believable fake answer
                  </label>
                  <span className={`text-xs font-mono ${text.length >= 72 ? 'text-amber-300' : 'text-slate-500'}`}>
                    {text.length}/80
                  </span>
                </div>
                <textarea
                  id="bluff-answer"
                  value={text}
                  onChange={(event) => setText(event.target.value.slice(0, 80))}
                  maxLength={80}
                  rows={2}
                  placeholder="Write a short answer that sounds suspiciously plausible…"
                  className="w-full resize-none px-4 py-4 rounded-2xl bg-black/45 border border-white/15 focus:border-fuchsia-300/70 focus:ring-2 focus:ring-fuchsia-400/20 outline-none text-white text-base placeholder:text-slate-500"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Be concise, plausible, and funny. Your name stays hidden until the reveal.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Lock your truth wager
                  </div>
                  {finale && <span className="text-[10px] font-mono text-amber-300">FINALE: TRUTH PAYOUTS ×2</span>}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {WAGERS.map((option) => {
                    const active = wager === option.value;
                    const styles = toneStyles[option.tone];
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          sfx.playChipSelect(option.value);
                          setWager(option.value);
                        }}
                        aria-pressed={active}
                        className={`min-h-[96px] p-3 rounded-2xl border text-left transition ${
                          active
                            ? `${styles.border} ${styles.bg} ${styles.glow}`
                            : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.08]'
                        }`}
                      >
                        <div className={`font-mono text-[10px] uppercase tracking-wider ${active ? styles.text : 'text-slate-400'}`}>
                          {option.value}× {option.title}
                        </div>
                        <div className="font-display text-xl sm:text-2xl font-extrabold text-white mt-1">
                          {finale && option.value > 1 ? `+${(Number(option.payout.replace(/[+,]/g, '')) * 2).toLocaleString()}` : option.payout}
                        </div>
                        <div className={`text-[10px] mt-1 ${option.value > 1 ? 'text-rose-300' : 'text-slate-400'}`}>
                          {option.risk}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Correct: +500 × wager{finale ? ' (doubled this finale)' : ''}. A wrong 2×/3× verdict costs 250/500. Safe has no miss penalty.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={!currentPlayer.gambits.double_agent}
                  onClick={() => {
                    sfx.playClick();
                    setGambit(gambit === 'double_agent' ? null : 'double_agent');
                  }}
                  aria-pressed={gambit === 'double_agent'}
                  className={`p-3.5 rounded-2xl border text-left transition disabled:opacity-45 disabled:cursor-not-allowed ${
                    gambit === 'double_agent'
                      ? 'border-fuchsia-300/70 bg-fuchsia-500/15'
                      : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-fuchsia-300" />
                    <span className="text-xs font-bold text-white">Double Agent</span>
                    {gambit === 'double_agent' && <Check className="w-3.5 h-3.5 text-fuchsia-200 ml-auto" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">This bluff pays +800 per player fooled. One use per match.</p>
                </button>
                <button
                  type="button"
                  disabled={!currentPlayer.gambits.shield_bet}
                  onClick={() => {
                    sfx.playClick();
                    setGambit(gambit === 'shield_bet' ? null : 'shield_bet');
                  }}
                  aria-pressed={gambit === 'shield_bet'}
                  className={`p-3.5 rounded-2xl border text-left transition disabled:opacity-45 disabled:cursor-not-allowed ${
                    gambit === 'shield_bet'
                      ? 'border-amber-300/70 bg-amber-500/15'
                      : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold text-white">Aegis Shield</span>
                    {gambit === 'shield_bet' && <Check className="w-3.5 h-3.5 text-amber-200 ml-auto" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">If wrong: absorb wager loss, preserve streak, gain +200 insurance.</p>
                </button>
              </div>

              {error && (
                <div role="alert" className={`flex gap-2 p-3 rounded-xl border text-xs ${error.includes('TRUTH_INTERCEPTED') ? 'bg-amber-500/10 border-amber-400/30 text-amber-100' : 'bg-rose-500/10 border-rose-400/30 text-rose-100'}`}>
                  <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error.replace('TRUTH_INTERCEPTED: ', '')}</span>
                </div>
              )}

              <button
                type="button"
                disabled={loading || text.trim().length < 2}
                onClick={() => {
                  sfx.playLockIn();
                  onSubmitBluff(text.trim(), wager, gambit);
                }}
                className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 text-slate-950 font-display font-extrabold text-base shadow-[0_0_30px_rgba(255,42,133,0.25)] hover:brightness-110 transition disabled:opacity-40"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LockKeyhole className="w-4 h-4" />
                  {loading ? 'Encrypting your bluff…' : 'Lock Bluff & Wager'}
                </span>
              </button>
            </div>
          ) : (
            <div className="mt-5 p-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10">
              <div className="flex items-center gap-2 text-emerald-200 font-display font-bold">
                <BadgeCheck className="w-5 h-5" /> Bluff encrypted & wager locked
              </div>
              <div className="mt-3 p-3 rounded-xl bg-black/25 border border-white/10 text-white font-semibold">
                “{ownSubmission.text}”
              </div>
              <div className="flex items-center justify-between gap-2 mt-3 text-xs text-slate-300">
                <span>{ownSubmission.wager}× wager{ownSubmission.gambitUsed ? ` • ${ownSubmission.gambitUsed === 'double_agent' ? 'Double Agent' : 'Aegis Shield'}` : ''}</span>
                <span>Waiting for the others…</span>
              </div>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-[28px] border border-white/12 bg-[#0D1124]/85 p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Forge status</div>
                <div className="font-display text-xl font-bold text-white mt-1">
                  {submittedIds.size} <span className="text-slate-500">/</span> {room.players.length} locked
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-400/30 flex items-center justify-center">
                <LockKeyhole className="w-5 h-5 text-fuchsia-200" />
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-amber-300 transition-all duration-500" style={{ width: `${room.players.length ? (submittedIds.size / room.players.length) * 100 : 0}%` }} />
            </div>
            <div className="space-y-2">
              {room.players.map((player) => {
                const isLocked = submittedIds.has(player.id);
                return (
                  <div key={player.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.035] border border-white/[0.06]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{player.avatar}</span>
                      <span className="text-xs font-semibold truncate" style={{ color: player.color }}>{player.name}{player.id === currentPlayer.id ? ' · YOU' : ''}</span>
                      {player.isBot && <Bot className="w-3.5 h-3.5 text-violet-300" />}
                    </div>
                    {isLocked ? <span className="text-[10px] uppercase tracking-wider text-emerald-300">Encrypted</span> : <span className="inline-flex items-center gap-1 text-[10px] text-slate-500"><Clock3 className="w-3 h-3" />Writing</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 border border-white/10">
            <div className="text-xs font-bold text-white">Designer's tip</div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">The best bluff is believable enough to be true, but just weird enough to be memorable. Keep it short: your friends will see every answer at once.</p>
          </div>

          {currentPlayer.isHost && (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                sfx.playClick();
                onForceNextPhase();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono uppercase tracking-wider transition"
            >
              <FastForward className="w-4 h-4" />
              <span>Close Forge & Show Lineup</span>
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};
