import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface FlipParticleTrigger {
  id: number;
  direction: 'next' | 'prev';
  timestamp: number;
}

interface ParticleItem {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  glowColor: string;
  rotation: number;
  targetRotation: number;
  type: 'orb' | 'star' | 'leaf';
  duration: number;
  delay: number;
}

interface PageFlipParticlesProps {
  trigger: FlipParticleTrigger | null;
  bookWidth: number;
  bookHeight: number;
  isPortrait: boolean;
}

const GOLD_PALETTE = [
  { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)' },
  { color: '#fff3b0', glow: 'rgba(255, 243, 176, 0.8)' },
  { color: '#f3c969', glow: 'rgba(243, 201, 105, 0.75)' },
  { color: '#e5a93c', glow: 'rgba(229, 169, 60, 0.7)' },
  { color: '#c49752', glow: 'rgba(196, 151, 82, 0.65)' },
  { color: '#ecd09e', glow: 'rgba(236, 208, 158, 0.8)' },
];

export const PageFlipParticles: React.FC<PageFlipParticlesProps> = ({
  trigger,
  bookWidth,
  bookHeight,
  isPortrait,
}) => {
  const [particles, setParticles] = useState<ParticleItem[]>([]);
  const lastTriggerIdRef = useRef<number | null>(null);

  const spawnParticles = useCallback(
    (direction: 'next' | 'prev') => {
      if (bookWidth <= 0 || bookHeight <= 0) return;

      const isNext = direction === 'next';
      const count = isPortrait ? 22 : 30;
      const newBatch: ParticleItem[] = [];
      const batchId = Date.now();

      // In landscape:
      // - 'next': page flips from the right edge toward the center/left
      // - 'prev': page flips from the left edge toward the center/right
      // In portrait (single page):
      // - 'next': right edge inward
      // - 'prev': left edge inward
      const edgeX = isNext ? bookWidth - 8 : 8;

      for (let i = 0; i < count; i++) {
        // Distribute along the page edge height (between 8% and 92%)
        const progressY = 0.08 + (i / count) * 0.84 + (Math.random() * 0.06 - 0.03);
        const startY = Math.max(10, Math.min(bookHeight - 10, progressY * bookHeight));

        // Slight natural variance in start X along the page margin edge
        const startX = edgeX + (isNext ? -1 : 1) * (Math.random() * 12);

        // Particle sweep distance across the 3D flip arc
        // Major particles travel further towards the book spine/other page
        const sweepDistance =
          (isNext ? -1 : 1) *
          (Math.random() * (bookWidth * 0.42) + (bookWidth * 0.12));
        const targetX = startX + sweepDistance;

        // Air displacement lifts particles slightly or flutters them
        const lift = (Math.random() - 0.65) * 80;
        const targetY = startY + lift;

        const sizeRand = Math.random();
        const size = sizeRand > 0.75 ? 7 : sizeRand > 0.4 ? 4.5 : 3;

        const paletteChoice =
          GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];

        const typeChoice: 'orb' | 'star' | 'leaf' =
          sizeRand > 0.85 ? 'star' : sizeRand > 0.45 ? 'leaf' : 'orb';

        newBatch.push({
          id: `p-${batchId}-${i}`,
          startX,
          startY,
          targetX,
          targetY,
          size,
          color: paletteChoice.color,
          glowColor: paletteChoice.glow,
          rotation: Math.random() * 360,
          targetRotation: (Math.random() - 0.5) * 540,
          type: typeChoice,
          duration: 0.75 + Math.random() * 0.55,
          delay: Math.random() * 0.18,
        });
      }

      setParticles((prev) => [...prev.slice(-20), ...newBatch]);

      // Clean up batch after animations finish
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !p.id.startsWith(`p-${batchId}-`))
        );
      }, 1500);
    },
    [bookWidth, bookHeight, isPortrait]
  );

  useEffect(() => {
    if (!trigger) return;
    if (trigger.id === lastTriggerIdRef.current) return;
    lastTriggerIdRef.current = trigger.id;

    spawnParticles(trigger.direction);
  }, [trigger, spawnParticles]);

  if (particles.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-visible z-35"
      style={{
        width: `${bookWidth}px`,
        height: `${bookHeight}px`,
        perspective: '1200px',
      }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.startX,
              y: p.startY,
              scale: 0.2,
              opacity: 0,
              rotate: p.rotation,
              rotateX: 0,
              rotateY: 0,
            }}
            animate={{
              x: p.targetX,
              y: p.targetY,
              scale: [0.2, 1.25, 0.8, 0],
              opacity: [0, 0.95, 0.85, 0],
              rotate: p.rotation + p.targetRotation,
              rotateX: (Math.random() - 0.5) * 360,
              rotateY: (Math.random() - 0.5) * 360,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1], // natural cubic deceleration curve
            }}
            style={{
              position: 'absolute',
              width: `${p.size}px`,
              height: `${p.size}px`,
              willChange: 'transform, opacity',
            }}
          >
            {p.type === 'star' ? (
              <svg
                viewBox="0 0 24 24"
                fill={p.color}
                className="w-full h-full drop-shadow-[0_0_6px_rgba(255,215,0,0.85)]"
                style={{ filter: `drop-shadow(0 0 5px ${p.glowColor})` }}
              >
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            ) : p.type === 'leaf' ? (
              <div
                className="w-full h-full rounded-xs transform rotate-45"
                style={{
                  backgroundColor: p.color,
                  boxShadow: `0 0 7px ${p.glowColor}`,
                }}
              />
            ) : (
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `radial-gradient(circle, #ffffff 0%, ${p.color} 55%, transparent 100%)`,
                  boxShadow: `0 0 6px ${p.glowColor}`,
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
