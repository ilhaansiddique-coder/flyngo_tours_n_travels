'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#00eefc', '#f36523', '#1881ff', '#ffd700', '#34d399', '#a78bfa', '#f472b6', '#7b61ff'];
const COUNT = 90;

interface Piece {
  id: number;
  tx: number; // horizontal travel (vh)
  ty: number; // vertical travel (vh)
  rot: number;
  delay: number;
  color: string;
  size: number;
  round: boolean;
}

interface ConfettiProps {
  active: boolean;
  message?: string;
  duration?: number;
  onDone?: () => void;
}

function makePieces(): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    tx: (Math.random() - 0.5) * 90,
    ty: -(20 + Math.random() * 70),
    rot: 360 + Math.random() * 720,
    delay: Math.random() * 0.25,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    round: Math.random() < 0.3,
  }));
}

export default function Confetti({ active, message, duration = 2600, onDone }: ConfettiProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(makePieces());

    const timer = setTimeout(() => {
      setPieces([]);
      onDone?.();
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, duration]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden flex flex-col items-center justify-center">
      <style>{`
        @keyframes flyngo-confetti {
          0%   { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--tx)vw, var(--ty)vh) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      <div className="relative w-full h-full">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute left-1/2 top-1/2 block"
            style={{
              width: p.size,
              height: p.round ? p.size : p.size * 0.4,
              background: p.color,
              borderRadius: p.round ? '9999px' : '2px',
              ['--tx' as any]: `${p.tx}`,
              ['--ty' as any]: `${p.ty}`,
              ['--rot' as any]: `${p.rot}deg`,
              animation: `flyngo-confetti ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}s forwards`,
            }}
          />
        ))}
      </div>
      {message && (
        <div className="absolute bottom-[22%] px-6 py-4 rounded-2xl border border-accent/30 bg-surface-container-high/90 backdrop-blur-md shadow-2xl text-center animate-slide-up">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-display font-bold text-on-surface text-lg">{message}</p>
        </div>
      )}
    </div>
  );
}
