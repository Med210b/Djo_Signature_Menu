import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FlipBook, FlipBookHandle } from './components/FlipBook';
import { BookControls } from './components/BookControls';
import { TableOfContentsModal } from './components/TableOfContentsModal';
import { Hero3DBackground } from './components/Hero3DBackground';
import { initialMenuCategories, initialMenuSettings } from './data/menuData';
import { generateMenuPages } from './utils/pagination';
import { pageFlipAudio } from './utils/audio';
import { ambientAudio } from './utils/ambientAudio';

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

  // Modals state
  const [isTocOpen, setIsTocOpen] = useState(false);

  const flipBookRef = useRef<FlipBookHandle>(null);

  // Generate paginated pages from current categories & settings
  const pages = useMemo(() => {
    return generateMenuPages(categories, settings);
  }, [categories, settings]);

  // Keep sound synthesizer and ambient music muted state in sync
  const handleToggleSound = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    pageFlipAudio.setMuted(nextMuted);
    ambientAudio.setMuted(nextMuted);
  };

  // Adjust ambient jazz track volume and unmute if dragged from zero
  const handleVolumeChange = (newVolume: number) => {
    setMusicVolume(newVolume);
    ambientAudio.setVolume(newVolume);
    if (newVolume > 0 && isSoundMuted) {
      setIsSoundMuted(false);
      pageFlipAudio.setMuted(false);
      ambientAudio.setMuted(false);
    }
  };

  // Start ambient audio on first user gesture if not muted
  useEffect(() => {
    const unlockAndStartAmbient = () => {
      if (!isSoundMuted && musicVolume > 0) {
        ambientAudio.start();
      }
      window.removeEventListener('pointerdown', unlockAndStartAmbient);
      window.removeEventListener('keydown', unlockAndStartAmbient);
      window.removeEventListener('touchstart', unlockAndStartAmbient);
    };

    window.addEventListener('pointerdown', unlockAndStartAmbient, { passive: true, once: true });
    window.addEventListener('keydown', unlockAndStartAmbient, { passive: true, once: true });
    window.addEventListener('touchstart', unlockAndStartAmbient, { passive: true, once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAndStartAmbient);
      window.removeEventListener('keydown', unlockAndStartAmbient);
      window.removeEventListener('touchstart', unlockAndStartAmbient);
    };
  }, [isSoundMuted, musicVolume]);

  // Fullscreen toggle handler
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
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        flipBookRef.current?.flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        flipBookRef.current?.flipPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setViewMode('spread');
        flipBookRef.current?.goToCover();
      } else if (e.key === 'End') {
        e.preventDefault();
        flipBookRef.current?.turnToPage(pages.length + 1);
      } else if (e.key === 'Escape') {
        setIsTocOpen(false);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        flipBookRef.current?.zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        flipBookRef.current?.zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        flipBookRef.current?.resetZoom();
      }
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
      {/* 3D Hero Gradient Background */}
      <Hero3DBackground />

      {/* Top Bar: Pushed perfectly to the top utilizing safe-area-inset for phone notches */}
      <div className="shrink-0 w-full z-30 sm:pt-3" style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}>
        <Header onLogoClick={handleReturnToCover} />
      </div>

      {/* Main Flipbook Arena: flex-1 dynamically fills space exactly between header and footer */}
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

      {/* Bottom Floating Control Bar: Pushed perfectly to the bottom using safe-area-inset for phone swipe bars */}
      <footer 
        className="shrink-0 w-full flex justify-center z-20 sm:pb-6" 
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
      >
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

      {/* Table of Contents Modal */}
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