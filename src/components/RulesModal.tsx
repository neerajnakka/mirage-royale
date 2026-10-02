import React, { useState } from 'react';
import { X, Shield, Sparkles, Radar, Trophy, Flame, CheckCircle2, HelpCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'flow' | 'scoring' | 'gambits'>('flow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0D1021]/95 shadow-[0_0_70px_rgba(0,242,254,0.18)] overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                MIRAGE ROYALE — Official Rulebook
              </h2>
              <p className="text-xs text-slate-400">
                2–8 Players • Cross-Device Room Code • 3 High-Stakes Rounds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition"
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/30 px-6 pt-3 gap-2">
          {[
            { id: 'flow', label: '1. How to Play (4 Stages)' },
            { id: 'scoring', label: '2. Points & Wagers' },
            { id: 'gambits', label: '3. Tactical Gambits' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition ${
                tab === t.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-4">
          {tab === 'flow' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center font-mono font-bold text-sky-300 shrink-0">
                  01
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    Stage 1: Dossier Category Vote
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Every round begins with 3 weird-but-true categories (like <em>Classified History</em> or <em>Bizarre Laws</em>). Every player taps to vote; the majority choice unlocks the round’s secret fact.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center font-mono font-bold text-fuchsia-300 shrink-0">
                  02
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    Stage 2: Craft Your Forgery & Stake Your Wager
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    A bizarre real-world fact appears with a missing blank (<code className="text-fuchsia-300">_____</code>). Write a believable fake answer to fool other players! Simultaneously, pick a <strong>1x, 2x, or 3x Confidence Wager</strong> on your ability to spot the real truth next.
                  </p>
                  <p className="text-xs text-amber-300/90 mt-1.5">
                    💡 <strong>Truth-Trap Protection:</strong> If you accidentally type the real answer, the game privately warns you so you can write a fake instead!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-mono font-bold text-emerald-300 shrink-0">
                  03
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    Stage 3: The Suspect Lineup
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    All player forgeries are shuffled anonymously alongside the <strong>One Real Truth</strong>. Study the cards and lock in the one you think is real. You can also stamp your favorite funny lie with a <strong>🔥 Golden Lie Kudos</strong> (+150 bonus pts to its author!).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-mono font-bold text-amber-300 shrink-0">
                  04
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    Stage 4: Declassified Reveal & Grand Podium
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Cards flip to expose who wrote each lie, who got tricked, and the real historical/scientific fact. After <strong>Round 3 (Double Base Truth Finale!)</strong>, the highest total score wins the Championship Podium & Match Awards.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'scoring' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Spot the Real Truth
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-white mt-1">
                    +500 × Wager
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Correct verdict: <strong>+500</strong> (1×), <strong>+1,000</strong> (2×), or <strong>+1,500 pts</strong> (3×). A wrong locked 2×/3× verdict costs <strong>−250/−500</strong>; 1× is safe. In Round 3, correct truth payouts double to <strong>1,000 × Wager</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
                      Fool a Rival Player
                    </span>
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-white mt-1">
                    +400 pts / victim
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Every player who votes for your fake answer awards you <strong>+400 pts</strong> (or <strong>+800 pts</strong> per victim with <em>Double Agent</em>!).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Truth Streak Bonus
                    </span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-white mt-1">
                    +250 pts
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Spot the real truth 2 or more rounds in a row to trigger an automatic Hot Streak bonus.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Golden Lie Kudos
                    </span>
                    <Flame className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="font-mono text-2xl font-extrabold text-white mt-1">
                    +150 pts / stamp
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Even if a bluff doesn’t fool people, rivals can stamp it as their favorite creative lie for +150 bonus pts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'gambits' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Every player starts a match with <strong>3 single-use Tactical Gambits</strong>. Deploying them at the right moment can swing the entire leaderboard:
              </p>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-cyan-400/20 text-cyan-300">
                  <Radar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    1. Truth Radar (Private Fake Filter)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong>Used during Stage 3 (Voting):</strong> Scans the suspect lineup and privately crosses out one fake answer on your screen, improving your odds without exposing the answer to anyone else.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/30 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-fuchsia-400/20 text-fuchsia-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    2. Double Agent (2x Trap Bounty)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong>Used during Stage 2 (Writing Bluff):</strong> When you craft a particularly devious lie, activate Double Agent to earn <strong>+800 pts</strong> (instead of +400) for every player who falls for it!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    3. Aegis Shield (Streak & Insurance Guard)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong>Used during Stage 2 (Writing Bluff):</strong> If you lock a wrong verdict this round, Aegis absorbs any wager penalty, protects your Truth Streak, and pays <strong>+200 insurance points</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Tip: You can open this guide anytime from the top bar.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-sm hover:brightness-110 transition"
          >
            Got It, Let’s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
