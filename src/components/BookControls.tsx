import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume1,
  Volume2,
  VolumeX,
  Music,
  BookOpen,
  RotateCcw,
  List,
  Columns,
  FileText,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface BookControlsProps {
  currentPage: number; 
  totalPages: number; 
  onPrev: () => void;
  onNext: () => void;
  onGoToCover: () => void;
  onGoToPage: (pageIndex: number) => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  musicVolume: number;
  onVolumeChange: (volume: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenToc: () => void;
  isPortrait: boolean;
  viewMode?: 'spread' | 'single';
  onToggleViewMode?: () => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export const BookControls: React.FC<BookControlsProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToCover,
  isSoundMuted,
  onToggleSound,
  musicVolume,
  onVolumeChange,
  isFullscreen,
  onToggleFullscreen,
  onOpenToc,
  isPortrait,
  viewMode = 'spread',
  onToggleViewMode,
  zoom = 1.0,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const getPageLabel = () => {
    if (currentPage === 0) return 'Cover';
    if (currentPage >= totalPages - 1) return 'Back';

    if (viewMode === 'single' || isPortrait) {
      return `p. ${currentPage} / ${totalPages - 2}`;
    }

    const leftPageNum = currentPage % 2 === 1 ? currentPage : currentPage - 1;
    const rightPageNum = leftPageNum + 1;
    const maxInterior = totalPages - 2;

    if (rightPageNum <= maxInterior) {
      return `pp. ${leftPageNum}–${rightPageNum} / ${maxInterior}`;
    }
    return `p. ${leftPageNum} / ${maxInterior}`;
  };

  const isAtStart = currentPage === 0;
  const isAtEnd = currentPage >= totalPages - 1;

  return (
    <nav aria-label="Book navigation" className="relative z-30 flex flex-col items-center gap-1 sm:gap-2 max-w-full">
      <div className="flex items-center gap-0.5 sm:gap-2 px-1.5 sm:px-4 py-1 sm:py-2 rounded-full bg-black/30 sm:bg-[#1b1715]/90 backdrop-blur-sm sm:backdrop-blur-md border border-[#c49752]/15 sm:border-[#c49752]/25 shadow-none sm:shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-[#e2d5c5] max-w-[calc(100vw-8px)] sm:max-w-[calc(100vw-16px)] overflow-x-auto scrollbar-none scale-[0.92] sm:scale-100 origin-bottom">
        
        <button
          onClick={onGoToCover}
          disabled={isAtStart}
          title="Return to Cover"
          className="flex items-center gap-1 p-1 sm:px-2.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-serif tracking-wider uppercase transition-colors hover:text-[#f4ebd0] hover:bg-[#c49752]/15 disabled:opacity-35 disabled:hover:bg-transparent shrink-0"
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden md:inline">Cover</span>
        </button>

        <span className="hidden sm:block w-[1px] h-4 bg-[#c49752]/20" />

        <button
          onClick={onPrev}
          disabled={isAtStart}
          aria-label="Previous Page"
          title="Previous Page (Left Arrow)"
          className="p-1 sm:p-1.5 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] transition-colors disabled:opacity-35 disabled:hover:bg-transparent shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onOpenToc}
          title="View Table of Contents"
          className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/20 sm:bg-black/40 border border-[#c49752]/15 sm:border-[#c49752]/20 hover:border-[#c49752]/45 transition-colors group shrink-0"
        >
          <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c49752] group-hover:scale-110 transition-transform" />
          <span className="font-serif text-[10px] sm:text-xs tracking-wider text-[#e2d5c5] group-hover:text-[#f4ebd0] whitespace-nowrap">
            {getPageLabel()}
          </span>
        </button>

        <button
          onClick={onNext}
          disabled={isAtEnd}
          aria-label="Next Page"
          title="Next Page (Right Arrow)"
          className="p-1 sm:p-1.5 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] transition-colors disabled:opacity-35 disabled:hover:bg-transparent shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>

        <span className="w-[1px] h-3.5 sm:h-4 bg-[#c49752]/20 shrink-0" />

        {onZoomIn && onZoomOut && (
          <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-black/20 sm:bg-black/40 border border-[#c49752]/15 sm:border-[#c49752]/25 shrink-0 shadow-none sm:shadow-inner">
            <button
              onClick={onZoomOut}
              disabled={zoom <= 1.0}
              title="Zoom Out (-)"
              aria-label="Zoom Out"
              className="p-0.5 sm:p-1.5 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] transition-colors disabled:opacity-30 disabled:hover:bg-transparent shrink-0 cursor-pointer"
            >
              <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            <button
              onClick={onResetZoom}
              title={`Current Zoom: ${Math.round(zoom * 100)}% (Click to Reset 100%)`}
              className="px-1 sm:px-1.5 py-0.5 rounded-full hover:bg-[#c49752]/15 font-mono text-[9px] sm:text-[11px] text-[#c49752] hover:text-[#ffe699] transition-colors min-w-[28px] sm:min-w-[34px] text-center shrink-0 cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={onZoomIn}
              disabled={zoom >= 2.2}
              title="Zoom In (+)"
              aria-label="Zoom In"
              className="p-0.5 sm:p-1.5 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] transition-colors disabled:opacity-30 disabled:hover:bg-transparent shrink-0 cursor-pointer"
            >
              <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        )}

        <span className="hidden sm:block w-[1px] h-4 bg-[#c49752]/20" />

        <button
          onClick={onOpenToc}
          title="Table of Contents"
          className="p-1 sm:p-1.5 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] transition-colors shrink-0"
        >
          <List className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2 py-0.5 rounded-full bg-black/20 sm:bg-black/40 border border-[#c49752]/15 sm:border-[#c49752]/20 shrink-0">
          <button
            onClick={onToggleSound}
            title={isSoundMuted ? 'Unmute Ambient Music & Page Sounds' : 'Mute Sound'}
            aria-label={isSoundMuted ? 'Unmute sound' : 'Mute sound'}
            className="p-0.5 sm:p-1.5 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] transition-colors shrink-0"
          >
            {isSoundMuted ? (
              <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
            ) : musicVolume === 0 ? (
              <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 text-[#c49752]" />
            ) : musicVolume < 0.5 ? (
              <Volume1 className="w-3 h-3 sm:w-4 sm:h-4 text-[#c49752]" />
            ) : (
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#c49752]" />
            )}
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1.5" title="Ambient Lounge Jazz Volume">
            <Music className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#c49752]/70 hidden md:block shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isSoundMuted ? 0 : musicVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Ambient background track volume"
              title={`Ambient Lounge Jazz: ${isSoundMuted ? 'Muted' : `${Math.round(musicVolume * 100)}%`}`}
              className="gold-slider w-10 sm:w-18 md:w-22 h-1 sm:h-1.5 rounded-full appearance-none cursor-pointer accent-[#c49752] focus:outline-none transition-all"
              style={{
                background:
                  isSoundMuted || musicVolume === 0
                    ? '#2e2621'
                    : `linear-gradient(to right, #c49752 ${Math.round(musicVolume * 100)}%, #2e2621 ${Math.round(
                        musicVolume * 100
                      )}%)`,
              }}
            />
            <span className="font-mono text-[8.5px] sm:text-[10px] text-[#c49752]/90 min-w-[18px] sm:min-w-[22px] text-right shrink-0">
              {isSoundMuted ? '0%' : `${Math.round(musicVolume * 100)}%`}
            </span>
          </div>
        </div>

        {onToggleViewMode && (
          <button
            onClick={onToggleViewMode}
            title={viewMode === 'spread' ? 'Switch to 1 Page Vertical View' : 'Switch to 2 Pages Landscape View'}
            className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] border border-[#c49752]/15 sm:border-[#c49752]/20 transition-colors shrink-0 text-[9px] sm:text-xs font-serif tracking-wider uppercase cursor-pointer"
          >
            {viewMode === 'spread' ? (
              <>
                <Columns className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c49752]" />
                <span className="hidden md:inline">2 Pages</span>
              </>
            ) : (
              <>
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c49752]" />
                <span className="hidden md:inline">1 Page</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-1 sm:p-1.5 rounded-full hover:bg-[#c49752]/20 text-[#e2d5c5] hover:text-[#f4ebd0] transition-colors shrink-0"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>

      <div className="hidden md:block text-[10px] sm:text-[11px] font-serif text-[#a89885] tracking-widest uppercase opacity-75 text-center px-2">
        Click or drag pages to flip · Use +/- in bar to zoom · Arrow keys to navigate
      </div>
    </nav>
  );
};