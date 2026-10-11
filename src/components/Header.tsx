import React, { useState, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { MENU_ASSETS } from '../data/menuData';

interface HeaderProps {
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // 3D Parallax Tilt Calculation on Mouse Move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-12deg to +12deg)
    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);

    // Specular light reflection coordinates (0% to 100%)
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlowPos({ x: 50, y: 50 });
  };

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    onLogoClick?.();
  };

  return (
    <header className="relative z-30 w-full pt-2 pb-1 sm:pt-3 sm:pb-2 px-3 flex justify-center items-center">
      {/* 3D Modern Interactive Brand Pedestal */}
      <div
        className="perspective-[1200px] select-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={badgeRef}
          onClick={handleClick}
          title="Return to Menu Cover"
          className="group relative cursor-pointer px-4 sm:px-8 py-2 sm:py-2.5 rounded-full border border-[#c49752]/40 bg-gradient-to-r from-[#171311]/90 via-[#241c18]/95 to-[#171311]/90 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(196,151,82,0.15)] flex items-center gap-3 sm:gap-4.5 transition-all duration-300 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${
              isPressed ? 0.97 : isHovered ? 1.03 : 1
            }, ${isPressed ? 0.97 : isHovered ? 1.03 : 1}, 1)`,
            transition: isHovered
              ? 'transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.3s ease'
              : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.5s ease',
          }}
        >
          {/* Dynamic Specular Sheen (follows cursor light in 3D) */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden"
            style={{
              background: `radial-gradient(circle 140px at ${glowPos.x}% ${glowPos.y}%, rgba(255, 235, 195, 0.28) 0%, rgba(196, 151, 82, 0.12) 45%, transparent 70%)`,
            }}
          />

          {/* Ambient Golden Aura Pulsing Glow */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#c49752]/20 via-[#f4ebd0]/15 to-[#c49752]/20 blur-md pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

          {/* Corner Sparkle Micro-Accents */}
          <Sparkles className="absolute -top-1.5 -left-1.5 w-4 h-4 text-[#ffd899] opacity-80 animate-spin pointer-events-none [animation-duration:8s]" />
          <Sparkles className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-[#c49752] opacity-70 animate-bounce pointer-events-none [animation-duration:3s]" />

          {/* 3D Elevated Logo Emblem */}
          <div
            className="relative shrink-0 transition-transform duration-300"
            style={{
              transform: 'translateZ(38px)',
            }}
          >
            {/* Logo Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-[#c49752]/40 blur-sm scale-110 group-hover:scale-125 transition-transform duration-500" />
            <img
              src={MENU_ASSETS.logo}
              alt="Djo Signature Emblem"
              referrerPolicy="no-referrer"
              className="relative w-8 h-8 sm:w-11 sm:h-11 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)] pointer-events-none transition-transform duration-300 group-hover:scale-108"
            />
          </div>

          {/* 3D Elevated Wordmark & Luxury Badge */}
          <div
            className="flex flex-col items-start transition-transform duration-300"
            style={{
              transform: 'translateZ(30px)',
            }}
          >
            {/* Main Title with 3D Metallic Gold Gradient */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif text-sm sm:text-xl font-extrabold tracking-[0.16em] sm:tracking-[0.2em] uppercase bg-gradient-to-r from-[#fbf5eb] via-[#ffe3b3] to-[#c49752] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(196,151,82,0.4)] whitespace-nowrap">
                Djo Signature Menue
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#c49752] shadow-[0_0_8px_#c49752] animate-ping" />
            </div>

            {/* Subtitle with High-Fashion Letterspacing */}
            <span className="font-serif text-[9px] sm:text-[11px] tracking-[0.28em] sm:tracking-[0.32em] uppercase text-[#b8a28b] group-hover:text-[#e4d3bf] transition-colors duration-300 whitespace-nowrap flex items-center gap-1.5">
              <span>Haute Café & Pâtisserie</span>
              <span className="text-[#c49752]/60 hidden md:inline">·</span>
              <span className="text-[#c49752]/80 text-[8px] sm:text-[10px] hidden md:inline tracking-widest italic">
                Interactive 3D Menu
              </span>
            </span>
          </div>

          {/* Interactive Turn Cue Icon */}
          <div
            className="ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-[#c49752]/30 flex items-center text-[#c49752] opacity-75 group-hover:opacity-100 transition-opacity"
            style={{
              transform: 'translateZ(25px)',
            }}
          >
            <span className="text-xs sm:text-sm font-serif italic text-[#e4d3bf] tracking-wider hidden sm:inline mr-1">
              Cover
            </span>
            <span className="text-sm sm:text-base group-hover:rotate-180 transition-transform duration-500">
              ↺
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

