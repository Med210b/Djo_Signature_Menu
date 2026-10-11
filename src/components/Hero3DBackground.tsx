import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hero 3D Animated Gradient Background
 *
 * Implements a modern luxury "Hero" stage 3D gradient presentation:
 * 1. 3D Hero Lamp & Volumetric Spotlight: Dual angled conic beams, an intense apex gold blade,
 *    and a downward atmospheric spotlight illuminating the book stage.
 * 2. 3D Aurora Gradient Mesh: Organic undulating waves flowing in 3D spatial depth
 *    with Djo Signature's luxury colors (Espresso, Cognac Amber, Rococo Gold #c49752, Molten Champagne).
 * 3. 3D Perspective Horizon & Showroom Floor: Receding spatial grid plane giving true depth.
 * 4. Interactive 3D Cursor Parallax: Smoothly tilts the lighting and stage in real 3D perspective.
 * 5. Floating 3D Golden Sparkles & Candlelight ambiance.
 */
export const Hero3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Normalized mouse/touch coordinates: -1 to 1 from center
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Smooth lerp for continuous 60fps 3D parallax
  useEffect(() => {
    const updateLerp = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.06;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.06;

      setMousePos({
        x: Math.round(currentPos.current.x * 1000) / 1000,
        y: Math.round(currentPos.current.y * 1000) / 1000,
      });

      animFrameId.current = requestAnimationFrame(updateLerp);
    };

    animFrameId.current = requestAnimationFrame(updateLerp);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent | MouseEvent) => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    // Map client coordinates to -1 ... 1
    const nx = (e.clientX / w) * 2 - 1;
    const ny = (e.clientY / h) * 2 - 1;
    targetPos.current = {
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    };
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove]);

  // Derived 3D transform values
  const tiltX = -mousePos.y * 5; // degrees
  const tiltY = mousePos.x * 7; // degrees
  const transX = mousePos.x * 14; // px
  const transY = mousePos.y * 10; // px

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0e0907]"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 35%',
      }}
    >
      {/* ============================================================ */}
      {/* 3D PARALLAX CONTAINER: Tilts smoothly with cursor in 3D space */}
      {/* ============================================================ */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-75 ease-out"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${transX}px, ${transY}px, 0)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Deep ambient roasted cocoa background */}
        <div className="absolute inset-0 bg-radial from-[#1e130e] via-[#100a08] to-[#080504]" />

        {/* ============================================================ */}
        {/* 1. HERO 3D LAMP & VOLUMETRIC SPOTLIGHT BEAMS                 */}
        {/* ============================================================ */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[650px] pointer-events-none">
          {/* Left Angled 3D Light Cone */}
          <div
            className="absolute top-0 right-1/2 w-[28rem] sm:w-[38rem] h-[28rem] sm:h-[32rem] opacity-75 blur-[55px] sm:blur-[70px] origin-top-right"
            style={{
              background:
                'conic-gradient(from 70deg at 100% 0%, #c49752 0deg, #915a28 35deg, transparent 65deg)',
              transform: 'rotate(-28deg) translate3d(0, 0, 40px)',
              animation: 'lampPulseLeft 8s ease-in-out infinite alternate',
            }}
          />

          {/* Right Angled 3D Light Cone */}
          <div
            className="absolute top-0 left-1/2 w-[28rem] sm:w-[38rem] h-[28rem] sm:h-[32rem] opacity-75 blur-[55px] sm:blur-[70px] origin-top-left"
            style={{
              background:
                'conic-gradient(from 290deg at 0% 0%, transparent 0deg, #915a28 30deg, #c49752 65deg)',
              transform: 'rotate(28deg) translate3d(0, 0, 40px)',
              animation: 'lampPulseRight 8s ease-in-out infinite alternate',
            }}
          />

          {/* Center Downward Volumetric Spotlight (Bathes the menu stage) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-[850px] h-[550px] sm:h-[650px] opacity-70 blur-[45px] sm:blur-[60px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(255, 230, 168, 0.45) 0%, rgba(196, 151, 82, 0.3) 30%, rgba(125, 64, 25, 0.15) 55%, transparent 75%)',
              clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
              animation: 'spotlightBreathe 7s ease-in-out infinite alternate',
            }}
          />

          {/* Incandescent Golden Lamp Core (Apex Glow) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[160px] rounded-full blur-[35px] opacity-85"
            style={{
              background:
                'radial-gradient(ellipse at 50% 20%, #fff2db 0%, #ffd680 30%, #c49752 60%, transparent 80%)',
            }}
          />

          {/* Intense Horizontal 3D Light Blade at Top Apex */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-full">
            {/* Outer soft halo */}
            <div className="w-[80vw] max-w-[680px] h-1.5 bg-gradient-to-r from-transparent via-[#ffd885] to-transparent blur-md opacity-80" />
            {/* Inner ultra-sharp light beam */}
            <div className="absolute top-0 w-[60vw] max-w-[480px] h-[2px] bg-gradient-to-r from-transparent via-[#ffffff] to-transparent shadow-[0_0_15px_#ffe299]" />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. 3D FLOWING AURORA GRADIENT MESH WAVES                     */}
        {/* ============================================================ */}
        <div className="absolute inset-0 overflow-hidden mix-blend-screen opacity-70">
          {/* Wave 1: Flowing Molten Rococo Gold */}
          <div
            className="absolute -top-[10%] -left-[15%] w-[85vw] h-[75vw] max-w-[1000px] max-h-[900px] rounded-[45%_55%_65%_35%] blur-[90px] opacity-75"
            style={{
              background:
                'radial-gradient(circle at 35% 40%, rgba(212, 175, 55, 0.65) 0%, rgba(196, 151, 82, 0.35) 45%, rgba(100, 52, 20, 0.1) 70%, transparent 85%)',
              animation: 'auroraWave1 22s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate',
            }}
          />

          {/* Wave 2: Spiced Amber Cognac Ribbon */}
          <div
            className="absolute top-[20%] -right-[15%] w-[80vw] h-[75vw] max-w-[950px] max-h-[850px] rounded-[55%_45%_35%_65%] blur-[95px] opacity-70"
            style={{
              background:
                'radial-gradient(circle at 60% 50%, rgba(186, 96, 32, 0.55) 0%, rgba(135, 60, 22, 0.3) 45%, rgba(60, 24, 12, 0.1) 70%, transparent 85%)',
              animation: 'auroraWave2 26s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate',
            }}
          />

          {/* Wave 3: Molten Champagne Shimmer & Candlelight Glow */}
          <div
            className="absolute -bottom-[20%] left-[15%] w-[75vw] h-[70vw] max-w-[900px] max-h-[800px] rounded-[50%_50%_60%_40%] blur-[80px] opacity-65"
            style={{
              background:
                'radial-gradient(circle at 45% 45%, rgba(247, 222, 163, 0.45) 0%, rgba(212, 168, 88, 0.25) 45%, transparent 70%)',
              animation: 'auroraWave3 19s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate',
            }}
          />

          {/* Wave 4: Dynamic Center Underflow */}
          <div
            className="absolute top-[35%] left-[25%] w-[60vw] h-[55vw] max-w-[700px] max-h-[650px] rounded-full blur-[100px] opacity-60"
            style={{
              background:
                'radial-gradient(circle, rgba(196, 151, 82, 0.4) 0%, rgba(145, 80, 28, 0.2) 40%, transparent 70%)',
              animation: 'auroraWave4 16s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* 3. 3D PERSPECTIVE SHOWROOM STAGE FLOOR                       */}
        {/* ============================================================ */}
        <div
          className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[160vw] h-[65vh] max-w-[1800px] pointer-events-none opacity-45"
          style={{
            transform: 'perspective(700px) rotateX(68deg) translate3d(0, 0, -40px)',
            transformOrigin: '50% 100%',
          }}
        >
          {/* Perspective Showroom Grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(196, 151, 82, 0.16) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(196, 151, 82, 0.16) 1px, transparent 1px)
              `,
              backgroundSize: '55px 55px',
              maskImage: 'radial-gradient(ellipse 65% 55% at 50% 45%, black 20%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 45%, black 20%, transparent 75%)',
            }}
          />
          {/* Warm Golden Showroom Pedestal Glow */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 45% at 50% 40%, rgba(196, 151, 82, 0.35) 0%, rgba(125, 60, 20, 0.15) 50%, transparent 80%)',
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* 4. INTERACTIVE 3D MOUSE SPOTLIGHT FOLLOWER                   */}
        {/* ============================================================ */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-55 transition-opacity duration-300"
          style={{
            left: `calc(50% + ${mousePos.x * 350}px - 250px)`,
            top: `calc(40% + ${mousePos.y * 220}px - 250px)`,
            background:
              'radial-gradient(circle, rgba(245, 215, 145, 0.35) 0%, rgba(196, 151, 82, 0.18) 40%, transparent 70%)',
            transform: 'translate3d(0, 0, 50px)',
          }}
        />

        {/* ============================================================ */}
        {/* 5. FLOATING 3D GOLDEN DUST PARTICLES & SPARKLES              */}
        {/* ============================================================ */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p, idx) => (
            <div
              key={idx}
              className="absolute rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                opacity: p.opacity,
                animation: `particleRise ${p.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite ${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* ============================================================ */}
        {/* 6. LUXURY VIGNETTE & MENU STAGE FOCUS                        */}
        {/* ============================================================ */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(14, 9, 7, 0.45) 65%, rgba(9, 6, 5, 0.85) 100%)',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* KEYFRAME ANIMATIONS FOR HERO 3D GRADIENT MOTION              */}
      {/* ============================================================ */}
      <style>{`
        @keyframes lampPulseLeft {
          0% { transform: rotate(-28deg) translate3d(0, 0, 40px) scale(1); opacity: 0.70; }
          50% { transform: rotate(-25deg) translate3d(15px, 10px, 50px) scale(1.08); opacity: 0.85; }
          100% { transform: rotate(-31deg) translate3d(-10px, -5px, 35px) scale(0.96); opacity: 0.72; }
        }
        @keyframes lampPulseRight {
          0% { transform: rotate(28deg) translate3d(0, 0, 40px) scale(1); opacity: 0.70; }
          50% { transform: rotate(31deg) translate3d(-15px, 10px, 50px) scale(1.08); opacity: 0.85; }
          100% { transform: rotate(25deg) translate3d(10px, -5px, 35px) scale(0.96); opacity: 0.72; }
        }
        @keyframes spotlightBreathe {
          0% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
          100% { opacity: 0.65; transform: scale(1); }
        }
        @keyframes auroraWave1 {
          0% { transform: translate3d(0, 0, 20px) rotate(0deg) scale(1); }
          50% { transform: translate3d(8vw, 6vh, 45px) rotate(4deg) scale(1.14); }
          100% { transform: translate3d(-6vw, -4vh, 10px) rotate(-3deg) scale(0.94); }
        }
        @keyframes auroraWave2 {
          0% { transform: translate3d(0, 0, 15px) rotate(0deg) scale(1); }
          50% { transform: translate3d(-7vw, -5vh, 40px) rotate(-4deg) scale(1.12); }
          100% { transform: translate3d(5vw, 7vh, 10px) rotate(3deg) scale(0.95); }
        }
        @keyframes auroraWave3 {
          0% { transform: translate3d(0, 0, 30px) rotate(0deg) scale(1); }
          50% { transform: translate3d(6vw, -6vh, 50px) rotate(3deg) scale(1.1); }
          100% { transform: translate3d(-5vw, 4vh, 20px) rotate(-2deg) scale(1.02); }
        }
        @keyframes auroraWave4 {
          0% { transform: scale(1) translate3d(0, 0, 25px); opacity: 0.5; }
          50% { transform: scale(1.18) translate3d(-3vw, 4vh, 40px); opacity: 0.75; }
          100% { transform: scale(0.96) translate3d(4vw, -2vh, 15px); opacity: 0.55; }
        }
        @keyframes particleRise {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          20% { opacity: 0.85; }
          80% { opacity: 0.85; }
          100% { transform: translate3d(25px, -140px, 30px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Seeded golden sparkles for high-end atmospheric luxury
const PARTICLES = [
  { left: 14, top: 28, size: 2.2, color: '#f5d791', opacity: 0.75, duration: 11, delay: 0 },
  { left: 22, top: 62, size: 3.0, color: '#ffe299', opacity: 0.85, duration: 13, delay: 2 },
  { left: 35, top: 40, size: 1.8, color: '#c49752', opacity: 0.65, duration: 14, delay: 4 },
  { left: 48, top: 18, size: 2.5, color: '#fff3db', opacity: 0.9, duration: 9, delay: 1 },
  { left: 62, top: 32, size: 2.0, color: '#f3cf7a', opacity: 0.75, duration: 12, delay: 3 },
  { left: 74, top: 58, size: 3.2, color: '#ffeab3', opacity: 0.85, duration: 15, delay: 0.5 },
  { left: 86, top: 24, size: 2.2, color: '#d4af37', opacity: 0.7, duration: 10, delay: 2.5 },
  { left: 18, top: 78, size: 1.6, color: '#c49752', opacity: 0.6, duration: 12, delay: 5 },
  { left: 42, top: 72, size: 2.8, color: '#ffd680', opacity: 0.8, duration: 16, delay: 1.5 },
  { left: 68, top: 76, size: 2.0, color: '#f5d791', opacity: 0.7, duration: 13, delay: 4.5 },
  { left: 52, top: 88, size: 1.8, color: '#c49752', opacity: 0.65, duration: 11, delay: 3 },
  { left: 80, top: 44, size: 2.6, color: '#ffe299', opacity: 0.8, duration: 14, delay: 6 },
];
