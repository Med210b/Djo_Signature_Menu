import React from 'react';
import { MenuBookSettings } from '../types/menu';
import { MENU_ASSETS } from '../data/menuData';

interface PageBackCoverProps {
  settings?: MenuBookSettings;
  onReturnToCover?: () => void;
}

export const PageBackCover: React.FC<PageBackCoverProps> = ({
  onReturnToCover,
}) => {
  return (
    <div
      className="page page-back relative w-full h-full bg-[#1b1715] select-none overflow-hidden cursor-pointer shadow-2xl"
      data-density="hard"
      onClick={onReturnToCover}
    >
      {/* Exact user back cover image */}
      <img
        src={MENU_ASSETS.backCover}
        alt="Menu Back Cover"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Book spine ridge on right edge for back cover */}
      <div className="absolute inset-y-0 right-0 w-[2px] bg-amber-400/30 pointer-events-none z-30" />
      <div className="absolute inset-y-0 right-0 w-3 pointer-events-none z-25 bg-gradient-to-l from-black/70 to-transparent" />
      <div
        className="inner-edge-fold-shadow absolute inset-y-0 right-0 pointer-events-none z-20 transition-all duration-150 ease-out"
        style={{
          width: 'var(--inner-edge-shadow-width, 32px)',
          background:
            'linear-gradient(to left, rgba(0, 0, 0, calc(var(--inner-edge-shadow-opacity, 0.3) * 1.6)) 0%, rgba(0, 0, 0, calc(var(--inner-edge-shadow-opacity, 0.3) * 0.8)) 40%, transparent 100%)',
        }}
      />

      {/* Subtle outer cover bevel & ambient vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] border border-amber-900/20" />

      {/* Subtle light sheen across the cover */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tl from-transparent via-white/[0.04] to-transparent" />

      {/* Interactive Turn Cue on bottom left corner to return to front */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/30 text-amber-100 text-xs font-serif tracking-widest uppercase transition-opacity duration-500">
        <span>↺</span>
        <span>Return to Front</span>
      </div>
    </div>
  );
};
