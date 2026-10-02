import React from 'react';
import { Sparkles, CheckCircle2, FastForward } from 'lucide-react';
import { Player, RoomState } from '../lib/types';
import { TiltCard } from './TiltCard';
import { sfx } from '../lib/sound';

interface CategoryStageProps {
  room: RoomState;
  currentPlayer: Player;
  loading: boolean;
  onVoteCategory: (categoryId: string) => void;
  onForceNextPhase: () => void;
}

export const CategoryStage: React.FC<CategoryStageProps> = ({
  room,
  currentPlayer,
  loading,
  onVoteCategory,
  onForceNextPhase,
}) => {
  const myVotedCatId =
    room.categoryOptions.find((c) => c.votes.includes(currentPlayer.id))?.id || null;

  const totalVotes = room.categoryOptions.reduce((acc, c) => acc + c.votes.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Stage Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            Round {room.roundNumber} of {room.totalRounds} • Stage 1: Select Dossier
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
          Vote on This Round’s Category
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Majority vote unlocks the classified trivia prompt.{' '}
          {room.roundNumber === room.totalRounds && (
            <strong className="text-amber-300">
              ⚡ FINAL ROUND: Base Truth Points are DOUBLED (1,000 × Wager)!
            </strong>
          )}
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {room.categoryOptions.map((cat) => {
          const isSelected = myVotedCatId === cat.id;
          const voters = room.players.filter((p) => cat.votes.includes(p.id));
          const votePct =
            room.players.length > 0
              ? Math.round((cat.votes.length / room.players.length) * 100)
              : 0;

          return (
            <TiltCard
              key={cat.id}
              onClick={() => {
                sfx.playLockIn();
                onVoteCategory(cat.id);
              }}
              glowColor={isSelected ? 'rgba(0, 242, 254, 0.35)' : 'rgba(168, 85, 247, 0.25)'}
              className={`p-6 transition border-2 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-500/20 to-[#0E1329]/95 border-cyan-400 shadow-[0_0_40px_rgba(0,242,254,0.28)]'
                  : 'bg-[#0D1124]/90 border-white/15 hover:border-white/35'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-3xl">
                    {cat.icon}
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-400/20 border border-cyan-300/40 text-cyan-200 text-xs font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> YOUR VOTE
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display font-extrabold text-xl text-white">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>
              </div>

              {/* Voter Avatars & Progress Bar */}
              <div className="pt-6 mt-6 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {voters.length} Vote{voters.length === 1 ? '' : 's'}
                  </span>
                  <span className="text-cyan-300 font-bold">{votePct}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${votePct}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[28px] pt-1">
                  {voters.map((v) => (
                    <div
                      key={v.id}
                      style={{ borderColor: v.color }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border text-xs"
                    >
                      <span>{v.avatar}</span>
                      <span className="font-semibold text-white text-[11px]">
                        {v.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Footer Status & Host Skip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
        <div className="text-xs sm:text-sm text-slate-300">
          Waiting for players to vote ({totalVotes}/{room.players.length} locked in)...
        </div>
        {currentPlayer.isHost && (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              sfx.playClick();
              onForceNextPhase();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-wider text-cyan-300 transition"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Lock Category Now</span>
          </button>
        )}
      </div>
    </div>
  );
};
