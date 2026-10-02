import React, { useEffect, useState } from 'react';
import { LiveReaction } from '../lib/types';
import { sfx } from '../lib/sound';

interface ReactionOverlayProps {
  reactions: LiveReaction[];
  onSendReaction: (emoji: string) => void;
}

const QUICK_EMOJIS = ['🔥', '😂', '🧠', '💀', '👀', '👑'];

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({
  reactions,
  onSendReaction,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const recentReactions = reactions.filter((r) => now - r.createdAt < 4500);

  return (
    <>
      {/* Floating Cross-Device Reaction Bubbles */}
      <div className="fixed inset-x-0 bottom-20 pointer-events-none z-40 flex flex-col items-end px-6 space-y-2 overflow-hidden">
        {recentReactions.map((rx, idx) => (
          <div
            key={rx.id}
            style={{
              borderColor: `${rx.playerColor}66`,
              animation: 'float 2.2s ease-out forwards',
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border backdrop-blur-md shadow-lg transition-all duration-500 ${
              idx % 2 === 0 ? 'mr-2' : 'mr-8'
            }`}
          >
            <span className="text-xl leading-none">{rx.emoji}</span>
            <span
              className="text-xs font-bold tracking-wide"
              style={{ color: rx.playerColor }}
            >
              {rx.playerName}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Floating Reaction Dock */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-6 z-30 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-950/85 border border-white/15 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1.5 hidden sm:inline">
          React
        </span>
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              sfx.playClick();
              onSendReaction(emoji);
            }}
            className="w-8 h-8 rounded-full hover:bg-white/15 active:scale-125 flex items-center justify-center text-base transition-transform"
            title={`Send ${emoji} reaction to all screens`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
