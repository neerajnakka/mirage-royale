import React, { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  FastForward,
  Flame,
  LockKeyhole,
  Radar,
  ShieldAlert,
  Sparkles,
  Star,
  TriangleAlert,
} from 'lucide-react';
import { Player, RoomState } from '../lib/types';
import { TiltCard } from './TiltCard';
import { sfx } from '../lib/sound';

interface VoteStageProps {
  room: RoomState;
  currentPlayer: Player;
  loading: boolean;
  onUseTruthRadar: () => void;
  onSubmitVote: (optionId: string) => void;
  onToggleKudos: (optionId: string) => void;
  onForceNextPhase: () => void;
}

export const VoteStage: React.FC<VoteStageProps> = ({
  room,
  currentPlayer,
  loading,
  onUseTruthRadar,
  onSubmitVote,
  onToggleKudos,
  onForceNextPhase,
}) => {
  const currentVote = room.votes[currentPlayer.id] || '';
  const currentKudos = room.kudosVotes[currentPlayer.id] || '';
  const [selectedOptionId, setSelectedOptionId] = useState(currentVote);
  const [kudosOptionId, setKudosOptionId] = useState(currentKudos);
  const [submittedNow, setSubmittedNow] = useState(Boolean(currentVote));
  const lockedCount = Object.keys(room.votes).filter((id) => Boolean(room.votes[id])).length;
  const myRadar = currentPlayer.eliminatedOptionId;
  const finale = room.roundNumber === room.totalRounds;

  useEffect(() => {
    setSelectedOptionId(currentVote);
    setSubmittedNow(Boolean(currentVote));
  }, [currentVote]);

  useEffect(() => {
    setKudosOptionId(currentKudos);
  }, [currentKudos]);

  const submitVerdict = () => {
    if (!selectedOptionId) return;
    sfx.playLockIn();
    onSubmitVote(selectedOptionId);
    setSubmittedNow(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-7">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Round {room.roundNumber} / {room.totalRounds} • Stage 3: Suspect Lineup</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
          Which Answer Is the <span className="text-emerald-300">Real Truth?</span>
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Pick one answer. Your own forgery is locked out. Votes stay private until everyone has decided.
          {finale && <strong className="block text-amber-200 mt-1">Finale truths pay double; bold wagers carry a miss penalty.</strong>}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-300">
          <span>{room.currentPrompt?.categoryIcon}</span>
          <span>{room.selectedCategory}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-300">
          <LockKeyhole className="w-3.5 h-3.5 text-emerald-300" />
          <span>{lockedCount}/{room.players.length} verdicts sealed</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-300/20 text-xs text-amber-200">
          <span>Your wager</span>
          <strong className="font-mono">{room.submissions[currentPlayer.id]?.wager || 1}×</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {room.lineup.map((option, index) => {
          const isMine = option.authorIds.includes(currentPlayer.id);
          const scannedOut = myRadar === option.id;
          const selected = selectedOptionId === option.id;
          const kudosSelected = kudosOptionId === option.id;
          const isDisabled = isMine || scannedOut;
          const glow = scannedOut ? 'rgba(255, 42, 133, 0.12)' : selected ? 'rgba(0, 242, 254, 0.28)' : 'rgba(0, 230, 153, 0.12)';
          return (
            <TiltCard
              key={option.id}
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                sfx.playClick();
                setSelectedOptionId(option.id);
              }}
              glowColor={glow}
              className={`relative min-h-[150px] p-5 sm:p-6 border-2 transition ${
                isMine
                  ? 'bg-white/[0.025] border-white/10 opacity-60 cursor-not-allowed'
                  : scannedOut
                  ? 'bg-rose-950/20 border-rose-400/25 opacity-45 grayscale'
                  : selected
                  ? 'bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 border-cyan-300/75 shadow-[0_0_35px_rgba(0,242,254,0.18)]'
                  : 'bg-[#0D1124]/90 border-white/15 hover:border-emerald-300/50'
              }`}
            >
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center font-mono text-[11px] text-slate-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {isMine && <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Your forgery</span>}
                {scannedOut && <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-rose-300"><ShieldAlert className="w-3.5 h-3.5" /> Radar: fake</span>}
              </div>
              <div className="pt-9">
                <p className={`font-display font-bold text-base sm:text-lg leading-relaxed ${scannedOut ? 'line-through text-slate-500' : 'text-white'}`}>
                  “{option.text}”
                </p>
              </div>
              {!isDisabled && (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className={`text-[10px] font-mono uppercase tracking-wider ${selected ? 'text-cyan-200' : 'text-slate-500'}`}>
                    {selected ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Your verdict</span> : 'Tap to select'}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      sfx.playClick();
                      setKudosOptionId(kudosSelected ? '' : option.id);
                      onToggleKudos(option.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold transition ${
                      kudosSelected
                        ? 'bg-amber-400/20 border-amber-300/60 text-amber-100'
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-amber-200 hover:border-amber-300/30'
                    }`}
                    title="Give this answer your one Golden Lie stamp"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {kudosSelected ? 'Stamped' : 'Golden Lie'}
                  </button>
                </div>
              )}
            </TiltCard>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <button
            type="button"
            disabled={!currentPlayer.gambits.truth_radar || Boolean(myRadar) || loading}
            onClick={() => {
              sfx.playRadarScan();
              onUseTruthRadar();
            }}
            className="inline-flex min-h-11 items-center gap-2 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-400/30 text-cyan-100 text-xs font-bold transition"
          >
            <Radar className="w-4 h-4" />
            <span>{myRadar ? 'Radar Deployed' : currentPlayer.gambits.truth_radar ? 'Scan one fake' : 'Radar used'}</span>
          </button>
          {myRadar && (
            <span className="text-[11px] text-emerald-200 inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> One fake marked on your screen only
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentPlayer.isHost && (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                sfx.playClick();
                onForceNextPhase();
              }}
              className="inline-flex min-h-11 items-center gap-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono uppercase tracking-wider transition"
            >
              <FastForward className="w-3.5 h-3.5" /> Skip to reveal
            </button>
          )}
          <button
            type="button"
            disabled={!selectedOptionId || loading || room.lineup.find((o) => o.id === selectedOptionId)?.authorIds.includes(currentPlayer.id) || room.lineup.find((o) => o.id === selectedOptionId)?.id === myRadar}
            onClick={submitVerdict}
            className="inline-flex min-h-11 items-center gap-2 px-5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-display font-extrabold text-sm shadow-[0_0_25px_rgba(0,230,153,0.2)] hover:brightness-110 transition disabled:opacity-40"
          >
            {submittedNow ? <Check className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
            {submittedNow ? 'Update verdict' : 'Lock verdict'}
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-500">
        Your ballot is private until all players lock in. Your own bluff is unselectable; the Radar scan is private to you.
      </p>
    </div>
  );
};
