import React, { useEffect, useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  HelpCircle,
  Trophy,
  Share2,
  LogOut,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Player, RoomState } from '../lib/types';
import { sfx } from '../lib/sound';

interface TopBarProps {
  room: RoomState | null;
  currentPlayer: Player | null;
  onOpenRules: () => void;
  onLeaveRoom: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  room,
  currentPlayer,
  onOpenRules,
  onLeaveRoom,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [muted, setMuted] = useState(sfx.muted);
  const [showStandings, setShowStandings] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!room?.phaseEndsAt) {
      setSecondsLeft(null);
      return;
    }
    const updateTimer = () => {
      if (!room.phaseEndsAt) {
        setSecondsLeft(null);
        return;
      }
      const diff = Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [room?.phaseEndsAt, room?.phase]);

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard?.writeText(room.code);
    sfx.playClick();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleCopyInviteLink = () => {
    if (!room) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    navigator.clipboard?.writeText(url);
    sfx.playClick();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sortedPlayers = room
    ? [...room.players].sort((a, b) => b.score - a.score)
    : [];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#070913]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-16 py-1 sm:py-0 sm:h-16 flex flex-wrap items-center justify-between gap-1 sm:gap-2">
        {/* Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-amber-400 p-[1.5px] shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <div className="w-full h-full bg-[#070913] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-display font-extrabold text-xs sm:text-base tracking-tight whitespace-nowrap bg-gradient-to-r from-white via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">
                MIRAGE ROYALE
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                Deception Arena
              </span>
            </div>
            {currentPlayer && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>{currentPlayer.avatar}</span>
                <span className="font-semibold text-slate-200">{currentPlayer.name}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {currentPlayer.score.toLocaleString()} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center Status Pills (Room Code + Round + Timer) */}
        {room && (
          <div className="order-3 w-full sm:order-none sm:w-auto flex items-center justify-center gap-1 sm:gap-2.5">
            <button
              onClick={handleCopyCode}
              className="group flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 transition"
              title="Click to copy 4-letter Room Code"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hidden sm:inline">
                Room
              </span>
              <span className="font-mono font-extrabold text-sm sm:text-base tracking-widest text-cyan-300">
                {room.code}
              </span>
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              )}
            </button>

            <button
              onClick={handleCopyInviteLink}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-xs font-semibold transition"
              title="Copy direct join URL for other devices"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Invite Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Invite Link</span>
                </>
              )}
            </button>

            {room.phase !== 'lobby' && room.phase !== 'game_over' && (
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-fuchsia-500/15 border border-fuchsia-400/30">
                <span className="font-mono text-xs font-bold text-fuchsia-200">
                  R{room.roundNumber}/{room.totalRounds}
                </span>
                {room.roundNumber === room.totalRounds && (
                  <span className="hidden md:inline text-[10px] font-mono uppercase px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded font-bold">
                    2X FINALE
                  </span>
                )}
              </div>
            )}

            {secondsLeft !== null && room.phase !== 'lobby' && room.phase !== 'round_reveal' && room.phase !== 'game_over' && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold ${
                  secondsLeft <= 10
                    ? 'bg-rose-500/20 border-rose-400/50 text-rose-300 animate-pulse'
                    : 'bg-white/5 border-white/15 text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{secondsLeft}s</span>
              </div>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {room && (
            <div className="relative">
              <button
                onClick={() => {
                  sfx.playClick();
                  setShowStandings((s) => !s);
                }}
                className="flex items-center gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-amber-300 transition"
                title="View Live Standings"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden lg:inline">Standings</span>
              </button>

              {showStandings && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0D1021]/95 border border-white/15 shadow-2xl backdrop-blur-xl p-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Live Leaderboard
                    </span>
                    <button
                      onClick={() => setShowStandings(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sortedPlayers.map((p, idx) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400 w-4">
                            #{idx + 1}
                          </span>
                          <span className="text-base">{p.avatar}</span>
                          <span
                            className="text-xs font-bold truncate max-w-[105px]"
                            style={{ color: p.color }}
                          >
                            {p.name}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-white">
                          {p.score.toLocaleString()} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              sfx.playClick();
              onOpenRules();
            }}
            className="flex items-center gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 transition"
            title="How to Play & Scoring Rules"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={() => setMuted(sfx.toggleMute())}
            className="p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white transition"
            title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          {room && (
            <button
              onClick={() => {
                sfx.playClick();
                onLeaveRoom();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition"
              title="Leave Room"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
