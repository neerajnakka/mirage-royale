import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Play,
  ArrowRight,
  Shield,
  Radar,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { PLAYER_AVATARS, PLAYER_COLORS } from '../lib/prompts';
import { TiltCard } from './TiltCard';
import { sfx } from '../lib/sound';

interface HomeScreenProps {
  initialRoomCode?: string;
  loading: boolean;
  error: string | null;
  onCreateRoom: (name: string, avatar: string, color: string) => void;
  onJoinRoom: (code: string, name: string, avatar: string, color: string) => void;
  onOpenRules: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  initialRoomCode = '',
  loading,
  error,
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
}) => {
  const [mode, setMode] = useState<'join' | 'host'>(initialRoomCode ? 'join' : 'host');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode.toUpperCase());
  const [avatar, setAvatar] = useState(PLAYER_AVATARS[0]);
  const [color, setColor] = useState(PLAYER_COLORS[0]);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      setMode('join');
    }
  }, [initialRoomCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim();
    if (!cleanName) return;
    sfx.playLockIn();
    if (mode === 'host') {
      onCreateRoom(cleanName, avatar, color);
    } else {
      onJoinRoom(roomCode.trim().toUpperCase(), cleanName, avatar, color);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Hero & Self-Explanatory Game Rules */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-cyan-400/30 text-cyan-300 text-xs font-mono uppercase tracking-widest shadow-[0_0_25px_rgba(0,242,254,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>2–8 Players • Cross-Device Party Game</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-[1.04] tracking-tight text-white">
              FORGE THE LIE.{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                HUNT THE TRUTH.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Welcome to <strong className="text-white">Mirage Royale</strong>—the high-stakes social deception & bizarre trivia arena where players craft fake answers, stake multiplier chips, and deploy tactical gambits from any phone or laptop.
            </p>
          </div>

          {/* 4-Step Visual Rule Strip (Zero-Explanation Onboarding) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <TiltCard
              glowColor="rgba(0, 242, 254, 0.18)"
              className="p-4 bg-white/[0.04] border border-white/10 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-mono text-xs font-bold text-cyan-300 shrink-0">
                  01
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    Join by 4-Letter Code
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Host opens a room; 2–8 players join from any phone, tablet, or browser tab.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard
              glowColor="rgba(255, 42, 133, 0.18)"
              className="p-4 bg-white/[0.04] border border-white/10 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center font-mono text-xs font-bold text-fuchsia-300 shrink-0">
                  02
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    Write a Bluff & Stake Chips
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Fill in the blank of a bizarre real fact with a convincing lie + bet <strong className="text-fuchsia-300">1x, 2x, or 3x</strong>.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard
              glowColor="rgba(0, 230, 153, 0.18)"
              className="p-4 bg-white/[0.04] border border-white/10 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-mono text-xs font-bold text-emerald-300 shrink-0">
                  03
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    Deploy Tactical Gambits
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Use <strong className="text-emerald-300">Truth Radar (private fake filter)</strong>, <strong className="text-fuchsia-300">Double Agent</strong>, or <strong className="text-amber-300">Aegis Shield</strong> once per match.
                  </p>
                </div>
              </div>
            </TiltCard>

            <TiltCard
              glowColor="rgba(255, 184, 0, 0.18)"
              className="p-4 bg-white/[0.04] border border-white/10 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-mono text-xs font-bold text-amber-300 shrink-0">
                  04
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    Score Truths & Deceptions
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Earn <strong className="text-amber-300">+500×Wager</strong> for spotting truth & <strong className="text-amber-300">+400 pts</strong> per player you fool!
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Tactical Feature Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onOpenRules();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-xs font-semibold text-cyan-200 transition"
            >
              <HelpCircle className="w-4 h-4 text-cyan-300" />
              <span>Read Full Interactive Rulebook</span>
            </button>
            <div className="flex items-center gap-4 text-xs text-slate-400 px-2">
              <span className="flex items-center gap-1">
                <Radar className="w-3.5 h-3.5 text-cyan-400" /> Private Fake Filter
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Streak Guard
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-fuchsia-400" /> Live Reactions
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Host / Join Command Console */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-[#0D1124]/90 border border-white/15 shadow-[0_0_65px_rgba(0,242,254,0.14)] backdrop-blur-2xl overflow-hidden">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-2 bg-black/40 border-b border-white/10">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setMode('host');
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-sm transition ${
                  mode === 'host'
                    ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Host New Game</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setMode('join');
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-sm transition ${
                  mode === 'join'
                    ? 'bg-gradient-to-r from-fuchsia-500 to-rose-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs font-medium">
                  ⚠️ {error}
                </div>
              )}

              {mode === 'join' && (
                <div>
                  <label htmlFor="room-code" className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                    4-Letter Room Code
                  </label>
                  <input
                    id="room-code"
                    type="text"
                    maxLength={6}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="E.G. NOVA"
                    required
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/50 border border-fuchsia-400/40 focus:border-fuchsia-400 focus:outline-none font-mono text-2xl font-extrabold tracking-[0.35em] text-center text-white uppercase placeholder:text-slate-600"
                  />
                </div>
              )}

              <div>
                <label htmlFor="player-name" className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Your Player Callsign (Name)
                </label>
                <input
                  id="player-name"
                  type="text"
                  maxLength={18}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none text-base font-semibold text-white placeholder:text-slate-500"
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Select Your Mask
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PLAYER_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      aria-label={`Select avatar ${av}`}
                      aria-pressed={avatar === av}
                      onClick={() => {
                        sfx.playClick();
                        setAvatar(av);
                      }}
                      className={`h-11 rounded-xl flex items-center justify-center text-xl transition ${
                        avatar === av
                          ? 'bg-white/20 border-2 border-cyan-400 scale-105 shadow-[0_0_15px_rgba(0,242,254,0.35)]'
                          : 'bg-white/[0.04] border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neon Aura Color Picker */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Select Neon Aura
                </label>
                <div className="flex items-center justify-between gap-2">
                  {PLAYER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        setColor(c);
                      }}
                      style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === c
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0D1124]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Select color ${c}`}
                      aria-pressed={color === c}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading || !playerName.trim() || (mode === 'join' && !roomCode.trim())}
                className={`w-full py-4 px-6 rounded-2xl font-display font-extrabold text-base flex items-center justify-center gap-2 transition shadow-xl disabled:opacity-50 ${
                  mode === 'host'
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 hover:brightness-110'
                    : 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 text-slate-950 hover:brightness-110'
                }`}
              >
                <span>
                  {loading
                    ? 'Connecting to Arena...'
                    : mode === 'host'
                    ? 'Create Room & Get Code'
                    : `Join Room ${roomCode || ''}`}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
