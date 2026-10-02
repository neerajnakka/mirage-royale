import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Play,
  Bot,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { Player, RoomState } from '../lib/types';
import { TiltCard } from './TiltCard';
import { sfx } from '../lib/sound';

interface LobbyScreenProps {
  room: RoomState;
  currentPlayer: Player;
  loading: boolean;
  onToggleReady: () => void;
  onUpdateTimer: (seconds: number) => void;
  onAddBot: () => void;
  onRemovePlayer: (targetId: string) => void;
  onStartGame: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  currentPlayer,
  loading,
  onToggleReady,
  onUpdateTimer,
  onAddBot,
  onRemovePlayer,
  onStartGame,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${room.code}`
      : '';

  const copyCode = () => {
    navigator.clipboard?.writeText(room.code);
    sfx.playClick();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const copyInviteUrl = () => {
    navigator.clipboard?.writeText(inviteUrl);
    sfx.playClick();
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const allReady = room.players.every((player) => player.isReady);
  const canStart = room.players.length >= 2 && allReady;
  const notReadyCount = room.players.filter((player) => !player.isReady).length;
  const emptySlotsCount = Math.max(0, 8 - room.players.length);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Room Code Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0E1329]/95 via-[#151B38]/95 to-[#0E1329]/95 border border-white/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,242,254,0.12)] backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lobby Open • {room.players.length}/8 Players Connected</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Gather Your Crew Across Devices
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Have players open this site on their phone, tablet, or another browser tab (or Incognito window) and enter the 4-letter Room Code below:
            </p>
          </div>

          {/* Giant Tactile Room Code Box */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-center">
            <button
              onClick={copyCode}
              className="group relative px-7 py-4 rounded-2xl bg-black/60 border-2 border-cyan-400/60 hover:border-cyan-300 shadow-[0_0_35px_rgba(0,242,254,0.22)] transition flex flex-col items-center"
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300/80">
                Room Code (Tap to Copy)
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="font-mono font-black text-3xl sm:text-4xl tracking-[0.28em] text-white">
                  {room.code}
                </span>
                {copiedCode ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition" />
                )}
              </div>
            </button>

            <button
              onClick={copyInviteUrl}
              className="px-5 py-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white font-display font-bold text-xs sm:text-sm flex items-center gap-2.5 transition"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Direct Join Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-fuchsia-400" />
                  <span>Copy Instant Join URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: 2–8 Player Arena Roster */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Connected Players ({room.players.length} / 8)</span>
            </h2>
            {currentPlayer.isHost && room.players.length < 8 && (
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onAddBot();
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs font-semibold transition"
              >
                <Bot className="w-4 h-4 text-violet-300" />
                <span>+ Add AI Challenger</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {room.players.map((p) => {
              const isMe = p.id === currentPlayer.id;
              return (
                <TiltCard
                  key={p.id}
                  glowColor={`${p.color}33`}
                  className="p-4 bg-[#0D1124]/90 border border-white/15 backdrop-blur-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        style={{
                          borderColor: p.color,
                          boxShadow: `0 0 18px ${p.color}40`,
                        }}
                        className="w-12 h-12 rounded-2xl bg-black/50 border-2 flex items-center justify-center text-2xl shrink-0"
                      >
                        {p.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-base text-white truncate">
                            {p.name}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                              YOU
                            </span>
                          )}
                          {p.isHost && (
                            <span title="Room Host" aria-label="Room Host">
                              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                            </span>
                          )}
                          {p.isBot && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase rounded bg-violet-500/20 text-violet-300 border border-violet-400/30">
                              AI
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              p.isReady ? 'text-emerald-400' : 'text-amber-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {p.isReady ? 'Ready for Launch' : 'Getting Ready...'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentPlayer.isHost && !p.isHost && (
                      <button
                        type="button"
                        onClick={() => onRemovePlayer(p.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                        title="Remove player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TiltCard>
              );
            })}

            {/* Empty Slots up to 4 visible placeholders so grid feels like an arena */}
            {Array.from({ length: Math.min(4, emptySlotsCount) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] flex items-center gap-3.5 text-slate-500"
              >
                <div className="w-12 h-12 rounded-2xl border border-dashed border-white/10 flex items-center justify-center font-mono text-xs">
                  0{room.players.length + idx + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-400">
                    Open Player Slot
                  </div>
                  <div className="text-xs text-slate-500">
                    Join with code <span className="font-mono text-slate-300">{room.code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Columns: Match Configuration & Launch Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-3xl bg-[#0D1124]/90 border border-white/15 p-6 space-y-5 backdrop-blur-xl">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-fuchsia-400" />
              <span>Match Settings</span>
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Round Timer Pace
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { sec: 45, label: '45s Blitz' },
                  { sec: 60, label: '60s Standard' },
                  { sec: 90, label: '90s Chill' },
                  { sec: 0, label: 'Untimed Mode' },
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    disabled={!currentPlayer.isHost}
                    onClick={() => {
                      sfx.playClick();
                      onUpdateTimer(opt.sec);
                    }}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition ${
                      room.settings.roundTimerSeconds === opt.sec
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white disabled:opacity-60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {!currentPlayer.isHost && (
                <p className="text-[11px] text-slate-400 mt-2">
                  The room host controls timer settings and starts the match.
                </p>
              )}
            </div>

            {/* Tactical Loadout Preview */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-300">
                Your Starting Gambits (1x Each)
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>🔍 <strong>Truth Radar:</strong> Eliminate 1 fake card during voting</div>
                <div>🎭 <strong>Double Agent:</strong> Earn 2x points (+800) per fooled rival</div>
                <div>🛡️ <strong>Aegis Shield:</strong> Protect your streak + 200 pts insurance</div>
              </div>
            </div>

            {/* Action Buttons */}
            {!currentPlayer.isHost ? (
              <button
                type="button"
                onClick={() => {
                  sfx.playLockIn();
                  onToggleReady();
                }}
                className={`w-full py-4 rounded-2xl font-display font-extrabold text-base transition ${
                  currentPlayer.isReady
                    ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200'
                    : 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950'
                }`}
              >
                {currentPlayer.isReady ? '✓ Ready! (Tap to Unready)' : 'Tap When Ready!'}
              </button>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={!canStart || loading}
                  onClick={() => {
                    sfx.playFanfare();
                    onStartGame();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 text-slate-950 font-display font-black text-base flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(0,242,254,0.35)] hover:brightness-110 transition disabled:opacity-40"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {canStart
                      ? `Launch ${room.totalRounds}-Round Match (${room.players.length} Players)`
                      : room.players.length < 2
                      ? 'Need at Least 2 Players to Start'
                      : `Waiting for ${notReadyCount} Player${notReadyCount === 1 ? '' : 's'} to Ready Up`}
                  </span>
                </button>
                {!canStart && room.players.length < 2 && (
                  <p className="text-xs text-center text-amber-300/90">
                    Open another device with code <strong>{room.code}</strong> or click <strong>+ Add AI Challenger</strong> above.
                  </p>
                )}
                {!canStart && room.players.length >= 2 && notReadyCount > 0 && (
                  <p className="text-xs text-center text-amber-300/90">
                    Every human challenger must tap <strong>Ready</strong> before launch. {notReadyCount} player{notReadyCount === 1 ? ' is' : 's are'} still deciding.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Live Room Pulse Feed */}
          <div className="rounded-3xl bg-[#0D1124]/80 border border-white/10 p-5 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Live Arena Feed
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto text-xs">
              {room.activityFeed.slice(0, 6).map((act) => (
                <div
                  key={act.id}
                  className="text-slate-300 flex items-center gap-2 py-1 border-b border-white/5 last:border-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{act.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
