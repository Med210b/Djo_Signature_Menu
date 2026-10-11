import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FlipBook, FlipBookHandle } from './components/FlipBook';
import { BookControls } from './components/BookControls';
import { TableOfContentsModal } from './components/TableOfContentsModal';
import { Hero3DBackground } from './components/Hero3DBackground';
import { initialMenuCategories, initialMenuSettings } from './data/menuData';
import { generateMenuPages } from './utils/pagination';
import { pageFlipAudio } from './utils/audio';

export default function App() {
  const [categories] = useState(initialMenuCategories);
  const [settings] = useState(initialMenuSettings);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(14);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [viewMode, setViewMode] = useState<'spread' | 'single'>('spread');
  const [zoom, setZoom] = useState(1.0);

  const [isTocOpen, setIsTocOpen] = useState(false);
  const flipBookRef = useRef<FlipBookHandle>(null);

  const pages = useMemo(() => {
    return generateMenuPages(categories, settings);
  }, [categories, settings]);

  const handleToggleSound = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    pageFlipAudio.setMuted(nextMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setMusicVolume(newVolume);
    if (newVolume > 0) {
      if (isSoundMuted) {
        setIsSoundMuted(false);
        pageFlipAudio.setMuted(false);
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); flipBookRef.current?.flipNext(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); flipBookRef.current?.flipPrev(); }
      else if (e.key === 'Home') { e.preventDefault(); setViewMode('spread'); flipBookRef.current?.goToCover(); }
      else if (e.key === 'End') { e.preventDefault(); flipBookRef.current?.turnToPage(pages.length + 1); }
      else if (e.key === 'Escape') setIsTocOpen(false);
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); flipBookRef.current?.zoomIn(); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); flipBookRef.current?.zoomOut(); }
      else if (e.key === '0') { e.preventDefault(); flipBookRef.current?.resetZoom(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages.length]);

  const handleReturnToCover = () => {
    setViewMode('spread');
    flipBookRef.current?.goToCover();
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-transparent text-[#e8dfd5] relative overflow-hidden selection:bg-[#c49752]/30 selection:text-[#fff4e0]">
      <Hero3DBackground />

      <div className="shrink-0 w-full z-30 mt-[12vh] sm:mt-0 sm:pt-3">
        <Header onLogoClick={handleReturnToCover} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-1 sm:px-6 relative z-10 w-full min-h-0 overflow-hidden">
        <FlipBook
          ref={flipBookRef}
          pages={pages}
          settings={settings}
          viewMode={viewMode}
          zoom={zoom}
          onZoomChange={setZoom}
          onPageChange={(pageIndex, total) => {
            setCurrentPage(pageIndex);
            setTotalPages(total);
          }}
          onOrientationChange={(isPort) => setIsPortrait(isPort)}
          onViewModeChange={(mode) => setViewMode(mode)}
        />
      </main>

      <footer className="shrink-0 w-full flex justify-center z-20 mb-[12vh] sm:mb-6">
        <BookControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => flipBookRef.current?.flipPrev()}
          onNext={() => flipBookRef.current?.flipNext()}
          onGoToCover={handleReturnToCover}
          onGoToPage={(idx) => flipBookRef.current?.turnToPage(idx)}
          isSoundMuted={isSoundMuted}
          onToggleSound={handleToggleSound}
          musicVolume={musicVolume}
          onVolumeChange={handleVolumeChange}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenToc={() => setIsTocOpen(true)}
          isPortrait={isPortrait}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode((prev) => (prev === 'spread' ? 'single' : 'spread'))}
          zoom={zoom}
          onZoomIn={() => flipBookRef.current?.zoomIn()}
          onZoomOut={() => flipBookRef.current?.zoomOut()}
          onResetZoom={() => flipBookRef.current?.resetZoom()}
        />
      </footer>

      <TableOfContentsModal
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        pages={pages}
        currentPage={currentPage}
        onSelectPage={(pageIdx) => {
          if (pageIdx === 0) {
            setViewMode('spread');
            flipBookRef.current?.goToCover();
          } else {
            flipBookRef.current?.turnToPage(pageIdx);
          }
        }}
      />
    </div>
  );
}