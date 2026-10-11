import React, { useEffect, useRef, useCallback } from 'react';

export interface GoldDustTrigger {
  id: number;
  direction: 'next' | 'prev';
  timestamp: number;
}

interface GoldDustEmitterProps {
  trigger: GoldDustTrigger | null;
  bookWidth: number;
  bookHeight: number;
  isPortrait: boolean;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  glowColor: string;
  twinkleSpeed: number;
  twinklePhase: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleOffset: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'mote' | 'sparkle' | 'fleck';
}

const GOLD_PALETTE = [
  { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)' },
  { color: '#fff8db', glow: 'rgba(255, 248, 219, 0.85)' },
  { color: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)' },
  { color: '#f3c969', glow: 'rgba(243, 201, 105, 0.75)' },
  { color: '#e5a93c', glow: 'rgba(229, 169, 60, 0.7)' },
  { color: '#d4af37', glow: 'rgba(212, 175, 55, 0.65)' },
];

export const GoldDustEmitter: React.FC<GoldDustEmitterProps> = ({
  trigger,
  bookWidth,
  bookHeight,
  isPortrait,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTriggerIdRef = useRef<number | null>(null);

  // Spawn gold dust motes upon completion of page turn
  const spawnDust = useCallback(
    (direction: 'next' | 'prev') => {
      if (bookWidth <= 0 || bookHeight <= 0) return;

      const isNext = direction === 'next';
      // 36-45 particles per burst: subtle, shimmering luxury gold dust
      const count = isPortrait ? 28 : 42;
      const newParticles: DustParticle[] = [];

      for (let i = 0; i < count; i++) {
        let spawnX: number;
        let spawnY: number;

        if (isPortrait) {
          // Across portrait page face, gently biased toward spine and landing margins
          spawnX = bookWidth * (0.15 + Math.random() * 0.75);
          spawnY = bookHeight * (0.12 + Math.random() * 0.76);
        } else {
          // In 2-page spread:
          // Turning forward (next) lands on LEFT page (0 to bookWidth * 0.5)
          // Turning backward (prev) lands on RIGHT page (bookWidth * 0.5 to bookWidth)
          if (isNext) {
            spawnX = bookWidth * (0.06 + Math.random() * 0.44);
          } else {
            spawnX = bookWidth * (0.50 + Math.random() * 0.44);
          }
          spawnY = bookHeight * (0.10 + Math.random() * 0.80);
        }

        const pal = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
        // Shapes: 60% glowing motes, 25% 4-pointed micro sparkles, 15% gold leaf flecks
        const shapeRand = Math.random();
        const shape: 'mote' | 'sparkle' | 'fleck' =
          shapeRand < 0.6 ? 'mote' : shapeRand < 0.85 ? 'sparkle' : 'fleck';

        // Gentle upward waft with subtle air drift
        const upwardSpeed = -(0.6 + Math.random() * 2.2);
        const driftSpeed = (Math.random() - 0.5) * 1.4;
        const maxLife = 70 + Math.floor(Math.random() * 45); // ~1.3s to 2.0s duration at 60fps

        newParticles.push({
          x: spawnX,
          y: spawnY,
          vx: driftSpeed,
          vy: upwardSpeed,
          size: 1.5 + Math.random() * 2.8,
          alpha: 0,
          maxLife,
          life: 0,
          color: pal.color,
          glowColor: pal.glow,
          twinkleSpeed: 0.08 + Math.random() * 0.14,
          twinklePhase: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.03 + Math.random() * 0.06,
          wobbleAmp: 0.4 + Math.random() * 1.2,
          wobbleOffset: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.08,
          shape,
        });
      }

      particlesRef.current.push(...newParticles);

      // Start animation loop if not already running
      if (!animFrameRef.current) {
        startAnimation();
      }
    },
    [bookWidth, bookHeight, isPortrait]
  );

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 16.67, 2.0);
      lastTime = currentTime;

      const particles = particlesRef.current;
      if (particles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Additive blending for luminous gold glow
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += delta;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Life progress 0 to 1
        const progress = p.life / p.maxLife;

        // Smooth fade in during first 15%, long delicate fade out over remaining 85%
        let currentAlpha: number;
        if (progress < 0.15) {
          currentAlpha = (progress / 0.15) * 0.95;
        } else {
          currentAlpha = (1 - (progress - 0.15) / 0.85) * 0.95;
        }

        // Subtle twinkle modulation
        const twinkle = Math.sin(p.life * p.twinkleSpeed + p.twinklePhase) * 0.25;
        currentAlpha = Math.max(0, Math.min(1, currentAlpha + twinkle));
        p.alpha = currentAlpha;

        // Apply physics: gentle drag and air wobble
        p.vy *= 0.985;
        p.vx *= 0.985;
        const wobble = Math.sin(p.life * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;
        p.x += (p.vx + wobble * 0.3) * delta;
        p.y += p.vy * delta;
        p.rotation += p.rotationSpeed * delta;

        // Render particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        if (p.shape === 'mote') {
          // Circular glowing dust mote
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.8);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.35, p.color);
          grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'sparkle') {
          // 4-pointed micro starburst glint
          const s = p.size * 1.5;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.6);
          ctx.quadraticCurveTo(0, 0, s * 1.6, 0);
          ctx.quadraticCurveTo(0, 0, 0, s * 1.6);
          ctx.quadraticCurveTo(0, 0, -s * 1.6, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s * 1.6);
          ctx.closePath();
          ctx.fill();

          // Hot white center dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Gold leaf fleck (tiny faceted diamond)
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.2, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, []);

  // Watch trigger prop to emit particles
  useEffect(() => {
    if (trigger && trigger.id !== lastTriggerIdRef.current) {
      lastTriggerIdRef.current = trigger.id;
      spawnDust(trigger.direction);
    }
  }, [trigger, spawnDust]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Update canvas internal resolution for retina displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bookWidth <= 0 || bookHeight <= 0) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = Math.round(bookWidth * dpr);
    canvas.height = Math.round(bookHeight * dpr);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, [bookWidth, bookHeight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-35"
      style={{
        width: `${bookWidth}px`,
        height: `${bookHeight}px`,
      }}
      aria-hidden="true"
    />
  );
};
