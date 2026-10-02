import React, { useEffect, useRef } from 'react';
import { GamePhase } from '../lib/types';

interface AuroraCanvasProps {
  phase: GamePhase | 'home';
}

const PHASE_PALETTES: Record<GamePhase | 'home', [string, string, string]> = {
  home: ['#00F2FE', '#FF2A85', '#7C3AED'],
  lobby: ['#00F2FE', '#8B5CF6', '#FF2A85'],
  category_select: ['#38BDF8', '#A855F7', '#F43F5E'],
  write_bluff: ['#FF2A85', '#FFB800', '#7C3AED'],
  vote_truth: ['#00E699', '#00F2FE', '#8B5CF6'],
  round_reveal: ['#FFB800', '#00F2FE', '#FF2A85'],
  game_over: ['#FFB800', '#FF2A85', '#00E699'],
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  colorIndex: number;
}

export const AuroraCanvas: React.FC<AuroraCanvasProps> = ({ phase }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<GamePhase | 'home'>(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.45 - 0.1,
      radius: Math.random() * 2.4 + 0.8,
      alpha: Math.random() * 0.55 + 0.15,
      colorIndex: i % 3,
    }));

    let tick = 0;

    const render = () => {
      tick += 0.006;
      const palette = PHASE_PALETTES[phaseRef.current] || PHASE_PALETTES.home;

      // Deep Obsidian Theatre Base
      ctx.fillStyle = '#05060C';
      ctx.fillRect(0, 0, width, height);

      // 3 Dynamic Chromatic Aurora Orbs
      const orbs = [
        {
          x: width * (0.22 + Math.sin(tick * 0.9) * 0.14),
          y: height * (0.25 + Math.cos(tick * 0.7) * 0.12),
          r: Math.max(width, height) * 0.48,
          color: palette[0],
        },
        {
          x: width * (0.78 + Math.cos(tick * 0.8) * 0.15),
          y: height * (0.35 + Math.sin(tick * 1.1) * 0.14),
          r: Math.max(width, height) * 0.45,
          color: palette[1],
        },
        {
          x: width * (0.5 + Math.sin(tick * 0.6 + 2) * 0.18),
          y: height * (0.82 + Math.cos(tick * 0.9) * 0.1),
          r: Math.max(width, height) * 0.52,
          color: palette[2],
        },
      ];

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const orb of orbs) {
        const grad = ctx.createRadialGradient(orb.x, orb.y, 10, orb.x, orb.y, orb.r);
        grad.addColorStop(0, `${orb.color}24`);
        grad.addColorStop(0.5, `${orb.color}0E`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating Prism Bokeh Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const color = palette[p.colorIndex];
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(tick * 3 + p.x));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle architectural perspective grid & vignette overlay */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(4,5,10,0.78)_100%)]" />
    </div>
  );
};
