import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Crown,
  ExternalLink,
  FastForward,
  Flame,
  Shield,
  Sparkles,
  Target,
  Trophy,
  UnlockKeyhole,
  X,
} from 'lucide-react';
import { Player, RoomState } from '../lib/types';
import { TRIVIA_SOURCES } from '../lib/prompts';
import { sfx } from '../lib/sound';

interface RevealStageProps {
  room: RoomState;
  currentPlayer: Player;
  loading: boolean;
  onRevealNext: () => void;
  onContinue: () => void;
}

export const RevealStage: React.FC<RevealStageProps> = ({
  room,
  currentPlayer,
  loading,
  onRevealNext,
  onContinue,
}) => {
  const prompt = room.currentPrompt;
  const revealedCount = room.revealStep;
  const allRevealed = revealedCount >= room.lineup.length;
  const truthOption = room.lineup.find((option) => option.isTruth);
  const breakdowns = room.lastRoundBreakdowns;
  const leader = [...room.players].sort((a, b) => b.score - a.score)[0];

  if (!prompt) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-300/30 text-amber-100 text-xs font-mono uppercase tracking-widest">
          <UnlockKeyhole className="w-3.5 h-3.5" />
          <span>Round {room.roundNumber} / {room.totalRounds} • Stage 4: Declassification</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
          The Truth Is <span className="text-amber-300">Out There.</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          The ballots are final. The host is opening each dossier—watch the real answer, forgeries, and score swings reveal in sequence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <section className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl border border-white/12 bg-[#0D1124]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Encrypted response cards</div>
              <div className="text-xs font-mono text-amber-200">{revealedCount}/{room.lineup.length} declassified</div>
            </div>
            <div className="space-y-3">
              {room.lineup.map((option, index) => {
                const isRevealed = index < revealedCount;
                const isTruth = isRevealed && option.isTruth;
                const authors = option.authorIds.map((id) => room.players.find((p) => p.id === id)).filter(Boolean) as Player[];
                const voters = option.voterIds.map((id) => room.players.find((p) => p.id === id)).filter(Boolean) as Player[];
                const kudos = option.kudosVoterIds.length;
                return (
                  <div
                    key={option.id}
                    className={`p-4 rounded-2xl border transition-all duration-500 ${
                      isTruth
                        ? 'bg-emerald-500/10 border-emerald-300/60 shadow-[0_0_30px_rgba(0,230,153,0.12)]'
                        : isRevealed
                        ? 'bg-white/[0.045] border-white/15'
                        : 'bg-black/25 border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs border shrink-0 ${isTruth ? 'bg-emerald-400/20 border-emerald-300/50 text-emerald-100' : isRevealed ? 'bg-white/10 border-white/10 text-slate-300' : 'bg-black/30 border-white/10 text-slate-500'}`}>
                        {isRevealed ? (isTruth ? <Check className="w-4 h-4" /> : String(index + 1).padStart(2, '0')) : '??'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {isRevealed ? (
                            isTruth ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 text-[10px] font-mono uppercase tracking-wider"><BadgeCheck className="w-3 h-3" /> The Real Truth</span>
                            ) : option.isHouseDecoy ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-500/15 border border-slate-400/20 text-slate-300 text-[10px] font-mono uppercase">House Decoy</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/25 text-fuchsia-200 text-[10px] font-mono uppercase">Player Forgery</span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-500 text-[10px] font-mono uppercase">Sealed dossier</span>
                          )}
                        </div>
                        <p className="font-display font-semibold text-sm sm:text-base text-white leading-relaxed">“{option.text}”</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                          {isRevealed && !isTruth && !option.isHouseDecoy && (
                            <span className="inline-flex items-center gap-1">
                              Forged by {authors.map((p) => <strong key={p.id} style={{ color: p.color }}>{p.avatar} {p.name}</strong>)}
                            </span>
                          )}
                          {isRevealed && voters.length > 0 && (
                            <span className="inline-flex items-center gap-1"><Target className="w-3 h-3 text-rose-300" /> fooled {voters.map((p) => p.name).join(', ')}</span>
                          )}
                          {isRevealed && kudos > 0 && (
                            <span className="inline-flex items-center gap-1 text-amber-200"><Flame className="w-3 h-3" /> {kudos} Golden Lie stamp{kudos === 1 ? '' : 's'}</span>
                          )}
                          {isRevealed && isTruth && voters.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-emerald-200"><Check className="w-3 h-3" /> spotted by {voters.map((p) => p.name).join(', ')}</span>
                          )}
                          {!isRevealed && <span>Who wrote it? Who believed it? Find out next…</span>}
                        </div>
                      </div>
                      {isRevealed && option.voterIds.length > 0 && (
                        <div className="shrink-0 text-right">
                          <span className="font-mono text-lg font-black text-amber-200">+{option.voterIds.length * (authors.some((p) => p.activeGambit === 'double_agent') ? 800 : 400)}</span>
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider">bluff bounty*</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {currentPlayer.isHost ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  if (allRevealed) {
                    sfx.playClick();
                    onContinue();
                  } else {
                    sfx.playFanfare();
                    onRevealNext();
                  }
                }}
                className={`w-full min-h-12 mt-4 rounded-2xl font-display font-extrabold text-sm flex items-center justify-center gap-2 transition ${allRevealed ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-slate-950' : 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950'}`}
              >
                {allRevealed ? <><ArrowRight className="w-4 h-4" /> Continue to {room.roundNumber >= room.totalRounds ? 'Championship' : 'Next Round'}</> : <><Sparkles className="w-4 h-4" /> Declassify next card</>}
              </button>
            ) : (
              <div className="w-full mt-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center text-xs text-slate-400">
                Waiting for {room.players.find((p) => p.isHost)?.name || 'host'} to reveal the next card…
              </div>
            )}
          </div>

          {allRevealed && (
            <div className="p-5 rounded-3xl border border-emerald-300/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
              <div className="flex items-center gap-2 text-emerald-100 font-display font-bold text-sm mb-2"><Sparkles className="w-4 h-4" /> FACT CHECK: {prompt.category}</div>
              <div className="font-display text-base text-white">{prompt.question.replace('_____', prompt.truth)}</div>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{prompt.factoid}</p>
              {TRIVIA_SOURCES[prompt.id] && (
                <a
                  href={TRIVIA_SOURCES[prompt.id].url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-1.5 mt-3 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-cyan-200 underline-offset-2 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Verify the dossier · {TRIVIA_SOURCES[prompt.id].label}
                </a>
              )}
              <div className="mt-4 p-3 rounded-xl bg-black/25 border border-white/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">The real answer</div>
                <div className="font-display font-bold text-emerald-200 mt-1">{truthOption?.text || prompt.truth}</div>
              </div>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/12 bg-[#0D1124]/90 p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Round score swing</div>
                <div className="font-display font-bold text-xl text-white mt-1">After round {room.roundNumber}</div>
              </div>
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-2.5">
              {breakdowns.map((breakdown, index) => {
                const player = room.players.find((p) => p.id === breakdown.playerId);
                return (
                  <div key={breakdown.playerId} className={`p-3 rounded-xl border ${index === 0 ? 'bg-amber-400/[0.07] border-amber-300/25' : 'bg-white/[0.035] border-white/[0.06]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {index === 0 ? <Crown className="w-4 h-4 text-amber-300 shrink-0" /> : <span className="font-mono text-xs text-slate-500 w-4">{index + 1}</span>}
                        <span className="text-base">{breakdown.avatar}</span>
                        <span className="text-xs font-bold truncate" style={{ color: breakdown.color }}>{breakdown.playerName}</span>
                      </div>
                      <span className={`font-mono text-sm font-extrabold ${breakdown.totalDelta > 0 ? 'text-emerald-200' : breakdown.totalDelta < 0 ? 'text-rose-300' : 'text-slate-400'}`}>
                        {breakdown.totalDelta > 0 ? '+' : ''}{breakdown.totalDelta.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2 text-[10px] text-slate-400">
                      {breakdown.truthPoints > 0 && <span className="text-emerald-300">Truth +{breakdown.truthPoints.toLocaleString()}</span>}
                      {breakdown.wagerPenalty > 0 && <span className="text-rose-300">Wager −{breakdown.wagerPenalty}</span>}
                      {breakdown.fooledPoints > 0 && <span className="text-fuchsia-300">Bluff +{breakdown.fooledPoints}</span>}
                      {breakdown.streakBonus > 0 && <span className="text-amber-200">Streak +{breakdown.streakBonus}</span>}
                      {breakdown.kudosBonus > 0 && <span className="text-orange-200">Kudos +{breakdown.kudosBonus}</span>}
                      {breakdown.shieldBonus > 0 && <span className="text-cyan-200">Aegis +{breakdown.shieldBonus}</span>}
                      {breakdown.totalDelta === 0 && <span>No points this round</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/12 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400"><Trophy className="w-4 h-4 text-amber-300" /> Current leader</div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{leader?.avatar}</span>
                <span className="font-display font-bold text-white" style={{ color: leader?.color }}>{leader?.name}</span>
              </div>
              <span className="font-mono text-base font-bold text-amber-200">{leader?.score.toLocaleString()} pts</span>
            </div>
            {truthOption && <div className="mt-3 text-[11px] text-slate-400">Truth answer: <strong className="text-emerald-200">{truthOption.text}</strong></div>}
          </div>

          <p className="text-[10px] text-slate-500">*Bluff bounty depends on whether the author used Double Agent. Final scoring above is authoritative.</p>
        </aside>
      </div>
    </div>
  );
};
