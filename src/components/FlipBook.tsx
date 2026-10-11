import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuPageData, MenuBookSettings } from '../types/menu';
import { PageCover } from './PageCover';
import { PageInside } from './PageInside';
import { PageBackCover } from './PageBackCover';
import { pageFlipAudio } from '../utils/audio';
import { PageFlipParticles, FlipParticleTrigger } from './PageFlipParticles';
import { GiltEdgeGlow } from './GiltEdgeGlow';

export interface FlipBookHandle {
  flipNext: () => void;
  flipPrev: () => void;
  turnToPage: (pageIndex: number) => void;
  goToCover: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  getCurrentPageIndex: () => number;
}

interface FlipBookProps {
  pages: MenuPageData[];
  settings: MenuBookSettings;
  viewMode?: 'spread' | 'single';
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  onPageChange?: (pageIndex: number, totalPages: number) => void;
  onOrientationChange?: (isPortrait: boolean) => void;
  onViewModeChange?: (mode: 'spread' | 'single') => void;
}

export const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(
  ({ pages, settings, viewMode = 'spread', zoom, onZoomChange, onPageChange, onOrientationChange, onViewModeChange }, ref) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const stagingRef = useRef<HTMLDivElement>(null);
    const pageFlipRef = useRef<PageFlip | null>(null);
    const currentPageRef = useRef<number>(0);

    const onPageChangeRef = useRef(onPageChange);
    onPageChangeRef.current = onPageChange;

    const onOrientationChangeRef = useRef(onOrientationChange);
    onOrientationChangeRef.current = onOrientationChange;

    const onViewModeChangeRef = useRef(onViewModeChange);
    onViewModeChangeRef.current = onViewModeChange;

    const isInitialPhone = typeof window !== 'undefined' ? (window.innerWidth < 768 || window.innerHeight < 600) : false;
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [pageWidth, setPageWidth] = useState(isInitialPhone ? 190 : 400);
    const [pageHeight, setPageHeight] = useState(isInitialPhone ? 250 : 560);
    const [isPortraitMode, setIsPortraitMode] = useState(false);
    // Dynamic horizontal offset percent to center single cover / back-cover pages on both mobile and desktop
    // Starts at -25% so before opening the closed cover is immediately dead-center in the middle of the screen
    const [offsetPercent, setOffsetPercent] = useState<number>(-25);

    // Total physical pages = 1 (Cover) + pages.length + 1 (Back Cover)
    const totalPhysicalPages = pages.length + 2;

    // Helper to calculate exact centering offset for any given page
    const getTargetOffset = useCallback((page: number, isPort: boolean) => {
      if (isPort) return 0;
      if (page === 0) return -25;
      if (page >= totalPhysicalPages - 1) return 25;
      return 0;
    }, [totalPhysicalPages]);

    // Dynamic page fold depth tracking state & refs (0 = resting flat, 1 = maximum paper fold depth)
    const [foldDepth, setFoldDepth] = useState<number>(0);
    const foldAnimRef = useRef<number | null>(null);
    const foldStateRef = useRef<string>('read');
    const foldStartTimeRef = useRef<number>(0);

    // Gilt edge glow state for user active page drag interaction
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragProgress, setDragProgress] = useState<number>(0);
    const [dragDirection, setDragDirection] = useState<'next' | 'prev'>('next');
    const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // 3D Spatial Modern Zoom State (controlled exclusively from the bottom bar for all devices)
    const [internalZoom, setInternalZoom] = useState<number>(zoom || 1.0);
    const currentZoom = zoom !== undefined ? zoom : internalZoom;
    const zoomViewportRef = useRef<HTMLDivElement>(null);

    const handleZoomStep = useCallback(
      (delta: number) => {
        const next = Math.max(1.0, Math.min(2.0, Number((currentZoom + delta).toFixed(2))));
        setInternalZoom(next);
        onZoomChange?.(next);
      },
      [currentZoom, onZoomChange]
    );

    const handleResetZoom = useCallback(() => {
      setInternalZoom(1.0);
      onZoomChange?.(1.0);
    }, [onZoomChange]);

    // Keep internal zoom synced with prop if prop changes
    useEffect(() => {
      if (zoom !== undefined && zoom !== internalZoom) {
        setInternalZoom(zoom);
      }
    }, [zoom, internalZoom]);

    // Glowing CSS bloom drop-shadow state that pulses during page turns
    const [isBloomPulsing, setIsBloomPulsing] = useState<boolean>(false);
    const bloomPulseTimerRef = useRef<NodeJS.Timeout | null>(null);

    const triggerBloomPulse = useCallback((durationMs: number = 750) => {
      setIsBloomPulsing(true);
      if (bloomPulseTimerRef.current) {
        clearTimeout(bloomPulseTimerRef.current);
      }
      bloomPulseTimerRef.current = setTimeout(() => {
        if (foldStateRef.current === 'read') {
          setIsBloomPulsing(false);
        }
      }, durationMs);
    }, []);

    const startFoldTracking = useCallback((state: string) => {
      foldStateRef.current = state;
      foldStartTimeRef.current = performance.now();

      if (state === 'user_fold') {
        setIsDragging(true);
        setIsBloomPulsing(true);
      } else if (state === 'flipping') {
        setIsDragging(false);
        setDragProgress(0);
        setIsBloomPulsing(true);
      } else {
        setIsDragging(false);
        setDragProgress(0);
        if (bloomPulseTimerRef.current) clearTimeout(bloomPulseTimerRef.current);
        bloomPulseTimerRef.current = setTimeout(() => {
          setIsBloomPulsing(false);
        }, 220);
      }

      if (foldAnimRef.current) {
        cancelAnimationFrame(foldAnimRef.current);
      }

      const animate = (now: number) => {
        const flip = pageFlipRef.current;
        if (!flip) return;

        const currentState = foldStateRef.current;
        let targetDepth = 0;

        if (currentState === 'user_fold') {
          // If user is actively dragging the fold, inspect shadow and flip controller progress
          try {
            const controller = (flip as any).getFlipController?.();
            const calc = controller?.calc;
            if (calc) {
              if (typeof calc.getFlippingProgress === 'function') {
                const raw = calc.getFlippingProgress(); // 0 to 100
                const norm = Math.min(Math.max(raw / 100, 0.08), 1.0);
                setDragProgress((prev) => Math.max(prev, norm));
              }
              if (typeof calc.getDirection === 'function') {
                const dir = calc.getDirection() === 1 ? 'prev' : 'next';
                setDragDirection(dir);
              }
            }

            const render = (flip as any).getRender?.();
            const shadow = render?.shadow;
            if (shadow && typeof shadow.progress === 'number') {
              const prog = Math.min(Math.max(shadow.progress, 0), 200);
              targetDepth = Math.sin((prog / 200) * Math.PI) * 1.15;
            } else {
              targetDepth = 0.75;
            }
          } catch {
            targetDepth = 0.75;
          }
        } else if (currentState === 'flipping') {
          // Page flip animation runs for 650ms; fold curve peaks mid-turn
          const elapsed = now - foldStartTimeRef.current;
          const duration = 650;
          const t = Math.min(Math.max(elapsed / duration, 0), 1);
          targetDepth = Math.sin(t * Math.PI) * 1.0;
        } else {
          targetDepth = 0;
        }

        targetDepth = Math.max(0, Math.min(1, targetDepth));

        setFoldDepth((prev) => {
          const next = prev + (targetDepth - prev) * 0.22;
          const roundedNext = Math.round(next * 1000) / 1000;

          if (containerRef.current) {
            const opacity = (0.26 + roundedNext * 0.54).toFixed(3);
            const width = `${Math.round(28 + roundedNext * 36)}px`;
            const ambientWidth = `${Math.round(52 + roundedNext * 28)}px`;
            containerRef.current.style.setProperty('--fold-depth', roundedNext.toFixed(3));
            containerRef.current.style.setProperty('--inner-edge-shadow-opacity', opacity);
            containerRef.current.style.setProperty('--inner-edge-shadow-width', width);
            containerRef.current.style.setProperty('--inner-edge-ambient-width', ambientWidth);
          }

          if (currentState !== 'read' || Math.abs(next - targetDepth) > 0.01) {
            foldAnimRef.current = requestAnimationFrame(animate);
          } else {
            foldAnimRef.current = null;
            setIsDragging(false);
            setDragProgress(0);
            if (containerRef.current) {
              containerRef.current.style.setProperty('--fold-depth', '0');
              containerRef.current.style.setProperty('--inner-edge-shadow-opacity', '0.26');
              containerRef.current.style.setProperty('--inner-edge-shadow-width', '28px');
              containerRef.current.style.setProperty('--inner-edge-ambient-width', '52px');
            }
          }

          return roundedNext;
        });
      };

      foldAnimRef.current = requestAnimationFrame(animate);
    }, []);

    // Particle effect state for 3D flip interaction
    const [particleTrigger, setParticleTrigger] = useState<FlipParticleTrigger | null>(null);
    const lastFlipDirectionRef = useRef<'next' | 'prev'>('next');
    const lastParticleTimeRef = useRef<number>(0);

    const triggerFlipParticles = useCallback((direction: 'next' | 'prev') => {
      lastFlipDirectionRef.current = direction;
      const now = Date.now();
      // Throttle rapid triggers within 180ms
      if (now - lastParticleTimeRef.current < 180) return;
      lastParticleTimeRef.current = now;
      setParticleTrigger({
        id: now + Math.random(),
        direction,
        timestamp: now,
      });
    }, []);

    // Helper to flip forward safely
    const handleNext = useCallback(() => {
      setHasInteracted(true);
      triggerFlipParticles('next');
      startFoldTracking('flipping');
      triggerBloomPulse(800);
      if (!pageFlipRef.current) return;
      const flip = pageFlipRef.current;
      const cur = flip.getCurrentPageIndex();
      const total = flip.getPageCount();

      if (cur < total - 1) {
        if (!isPortraitMode) {
          if (cur === 0) {
            setOffsetPercent(0);
          } else if (cur >= total - 3) {
            setOffsetPercent(25);
          }
        }
        try {
          flip.flipNext('top');
        } catch {
          flip.turnToNextPage();
        }
      }
    }, [triggerFlipParticles, startFoldTracking, triggerBloomPulse, isPortraitMode]);

    // Helper to flip backward safely
    const handlePrev = useCallback(() => {
      setHasInteracted(true);
      triggerFlipParticles('prev');
      startFoldTracking('flipping');
      triggerBloomPulse(800);
      if (!pageFlipRef.current) return;
      const flip = pageFlipRef.current;
      const cur = flip.getCurrentPageIndex();

      if (cur > 0) {
        if (!isPortraitMode) {
          if (cur <= 2) {
            setOffsetPercent(-25);
          } else if (cur >= totalPhysicalPages - 1) {
            setOffsetPercent(0);
          }
        }
        try {
          flip.flipPrev('top');
        } catch {
          flip.turnToPrevPage();
        }
      }
    }, [triggerFlipParticles, startFoldTracking, triggerBloomPulse, isPortraitMode, totalPhysicalPages]);

    // Expose methods to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        flipNext: handleNext,
        flipPrev: handlePrev,
        turnToPage: (pageIndex: number) => {
          setHasInteracted(true);
          const dir = pageIndex >= currentPageRef.current ? 'next' : 'prev';
          triggerFlipParticles(dir);
          startFoldTracking('flipping');
          triggerBloomPulse(800);
          currentPageRef.current = pageIndex;
          setCurrentPage(pageIndex);
          setOffsetPercent(getTargetOffset(pageIndex, isPortraitMode));
          if (pageFlipRef.current) {
            try {
              pageFlipRef.current.turnToPage(pageIndex);
            } catch {
              // fallback
            }
          }
        },
        goToCover: () => {
          setHasInteracted(true);
          triggerFlipParticles('prev');
          startFoldTracking('flipping');
          triggerBloomPulse(800);
          handleResetZoom();
          currentPageRef.current = 0;
          setCurrentPage(0);
          setOffsetPercent(getTargetOffset(0, isPortraitMode));
          if (pageFlipRef.current) {
            try {
              pageFlipRef.current.turnToPage(0);
            } catch {
              // fallback
            }
          }
        },
        zoomIn: () => handleZoomStep(0.25),
        zoomOut: () => handleZoomStep(-0.25),
        resetZoom: handleResetZoom,
        getCurrentPageIndex: () => currentPageRef.current,
      }),
      [handleNext, handlePrev, triggerFlipParticles, startFoldTracking, triggerBloomPulse, handleResetZoom, handleZoomStep, getTargetOffset, isPortraitMode]
    );

    // Build and initialize FlipBook with robust, deterministic dimensions
    const initFlipBook = useCallback(() => {
      if (!containerRef.current || !stagingRef.current) return;

      const hostContainer = containerRef.current;

      // Measure viewport & parent available space
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 900;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 700;
      const isMobilePhone = windowWidth < 640;
      const parentWidth = stageRef.current?.clientWidth || hostContainer.parentElement?.clientWidth || windowWidth;

      // Single-page vertical ONLY if explicitly toggled via viewMode === 'single'
      // By default (viewMode === 'spread'), the full 2-page spread appears even on mobile in portrait!
      const isPortrait = viewMode === 'single';
      setIsPortraitMode(isPortrait);

      let calcW: number;
      let calcH: number;

      if (isPortrait) {
        // Single-page vertical presentation (3:4 aspect ratio = 0.75)
        const availWidth = Math.max(Math.min(parentWidth, windowWidth) - (isMobilePhone ? 12 : 32), 220);
        const availHeight = Math.max(windowHeight - (isMobilePhone ? 130 : 160), 300);
        const maxW = Math.min(availWidth, 680);
        const maxH = Math.min(availHeight, 880);

        calcH = Math.min(maxH, Math.round(maxW / 0.75));
        calcW = Math.round(calcH * 0.75);

        if (calcW > maxW) {
          calcW = maxW;
          calcH = Math.round(calcW / 0.75);
        }

        calcW = Math.max(180, Math.floor(Number(calcW)) || 320);
        calcH = Math.max(240, Math.floor(Number(calcH)) || 430);
      } else {
        // Two-page spread presentation: Left & Right pages open side-by-side!
        // On phone in portrait, the entire 2 pages fit seamlessly within the phone's screen width and height.
        const marginX = isMobilePhone ? 8 : 36;
        const availWidth = Math.max(Math.min(parentWidth, windowWidth) - marginX, 260);
        const availHeight = Math.max(windowHeight - (isMobilePhone ? 130 : 160), 220);

        // Max spread width across 2 pages side-by-side
        const maxSpreadWidth = Math.min(availWidth, 1140);
        let pageW = Math.floor(maxSpreadWidth / 2);
        let pageH = Math.round(pageW / 0.75);

        // If height exceeds available vertical space, scale to fit height
        if (pageH > availHeight) {
          pageH = availHeight;
          pageW = Math.round(pageH * 0.75);
        }

        calcW = Math.max(120, Math.floor(Number(pageW)) || 175);
        calcH = Math.max(160, Math.floor(Number(pageH)) || 235);
      }

      setPageWidth(calcW);
      setPageHeight(calcH);

      // Clean up any existing flip instance
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch {
          // ignore
        }
        pageFlipRef.current = null;
      }
      hostContainer.innerHTML = '';

      // Create inner viewport element for PageFlip with appropriate width
      const bookEl = document.createElement('div');
      bookEl.className = 'flipbook-viewport';
      bookEl.style.width = isPortrait ? `${calcW}px` : `${calcW * 2}px`;
      bookEl.style.height = `${calcH}px`;
      bookEl.style.position = 'relative';
      hostContainer.appendChild(bookEl);

      // Track drag/click side from user pointer interactions to accurately orient the 3D particles
      const handleBookPointerDown = (e: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in e && (e as TouchEvent).touches[0]
          ? (e as TouchEvent).touches[0].clientX
          : (e as MouseEvent).clientX;
        const rect = bookEl.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const dir = clickX > rect.width * 0.5 ? 'next' : 'prev';
        lastFlipDirectionRef.current = dir;
        setDragDirection(dir);
        dragStartPosRef.current = { x: clientX, y: 0 };
      };
      bookEl.addEventListener('pointerdown', handleBookPointerDown as EventListener);

      // Clone staging page elements
      const sourcePages = Array.from(stagingRef.current.children) as HTMLElement[];
      const isPhoneMode = calcW < 340 || isMobilePhone;
      const clonedPages = sourcePages.map((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.width = `${calcW}px`;
        clone.style.height = `${calcH}px`;
        clone.style.display = 'block';
        clone.style.visibility = 'visible';
        if (isPhoneMode) {
          clone.classList.add('page-phone-mode');
        } else {
          clone.classList.add('page-web-mode');
        }
        return clone;
      });

      // If phone mode, directly force compact micro-typography on directory page clone
      if (isPhoneMode) {
        clonedPages.forEach((pageEl) => {
          const titles = pageEl.querySelectorAll('[data-dir-item="title"]');
          titles.forEach((t) => {
            (t as HTMLElement).style.fontSize = '6.2px';
            (t as HTMLElement).style.fontWeight = '500';
            (t as HTMLElement).style.textShadow = 'none';
            (t as HTMLElement).style.lineHeight = '1.25';
          });
          const pageLabels = pageEl.querySelectorAll('[data-dir-item="page"]');
          pageLabels.forEach((p) => {
            (p as HTMLElement).style.fontSize = '6.2px';
            (p as HTMLElement).style.fontWeight = '600';
            (p as HTMLElement).style.textShadow = 'none';
            (p as HTMLElement).style.lineHeight = '1.25';
          });
          const headings = pageEl.querySelectorAll('[data-dir-item="heading"]');
          headings.forEach((h) => {
            (h as HTMLElement).style.fontSize = '9.5px';
            (h as HTMLElement).style.color = '#975f31';
            (h as HTMLElement).style.textShadow = 'none';
          });
          const subs = pageEl.querySelectorAll('[data-dir-item="sub"]');
          subs.forEach((s) => {
            (s as HTMLElement).style.fontSize = '6px';
          });
          const dots = pageEl.querySelectorAll('[data-dir-item="dots"]');
          dots.forEach((d) => {
            (d as HTMLElement).style.borderColor = 'rgba(151, 95, 49, 0.3)';
            (d as HTMLElement).style.marginBottom = '2px';
          });
        });
      }

      // Add direct click handler on cloned cover to guarantee immediate responsive opening
      if (clonedPages.length > 0) {
        clonedPages[0].addEventListener('click', () => {
          if (pageFlipRef.current && pageFlipRef.current.getCurrentPageIndex() === 0) {
            triggerFlipParticles('next');
            if (!isPortrait) {
              setOffsetPercent(0);
            }
            try {
              pageFlipRef.current.flipNext('top');
            } catch {
              pageFlipRef.current.turnToNextPage();
            }
          }
        });
      }

      // Add direct click handler on cloned back cover
      if (clonedPages.length > 1) {
        const lastPageEl = clonedPages[clonedPages.length - 1];
        lastPageEl.addEventListener('click', () => {
          if (pageFlipRef.current) {
            const cur = pageFlipRef.current.getCurrentPageIndex();
            const total = pageFlipRef.current.getPageCount();
            if (cur >= total - 1) {
              triggerFlipParticles('prev');
              if (!isPortrait) {
                setOffsetPercent(0);
              }
              try {
                pageFlipRef.current.flipPrev('top');
              } catch {
                pageFlipRef.current.turnToPrevPage();
              }
            }
          }
        });
      }

      // Add direct click handlers for any interactive jump buttons (e.g. Menu Directory items)
      clonedPages.forEach((pageEl) => {
        const jumpButtons = pageEl.querySelectorAll('[data-jump-to-page]');
        jumpButtons.forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const targetPageStr = (btn as HTMLElement).getAttribute('data-jump-to-page');
            const targetPage = Number(targetPageStr);
            if (!isNaN(targetPage) && pageFlipRef.current) {
              setOffsetPercent(getTargetOffset(targetPage, isPortrait));
              try {
                pageFlipRef.current.turnToPage(targetPage);
              } catch (err) {
                console.error('Failed to flip to page', targetPage, err);
              }
            }
          });
        });
      });

      // Delegated click handler on bookEl for jump-to-page elements
      bookEl.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('[data-jump-to-page]');
        if (target && pageFlipRef.current) {
          e.stopPropagation();
          const targetPageStr = target.getAttribute('data-jump-to-page');
          const targetPage = Number(targetPageStr);
          if (!isNaN(targetPage)) {
            setOffsetPercent(getTargetOffset(targetPage, isPortrait));
            try {
              pageFlipRef.current.turnToPage(targetPage);
            } catch (err) {
              console.error('Failed to turn to page', targetPage, err);
            }
          }
        }
      });

      try {
        const pageFlipInstance = new PageFlip(bookEl, {
          width: calcW,
          height: calcH,
          size: 'fixed',
          minWidth: calcW,
          maxWidth: calcW,
          minHeight: calcH,
          maxHeight: calcH,
          drawShadow: true,
          maxShadowOpacity: 0.85,
          showCover: true,
          usePortrait: isPortrait,
          flippingTime: 650,
          mobileScrollSupport: false,
          swipeDistance: 25,
          clickEventForward: true,
          useMouseEvents: true,
          showPageCorners: true,
          disableFlipByClick: false,
        });

        pageFlipInstance.on('init', (e: { data?: { page: number; mode: string } }) => {
          setIsLoaded(true);
          const initPage = typeof e.data?.page === 'number' ? e.data.page : 0;
          setCurrentPage(initPage);
          currentPageRef.current = initPage;
          setOffsetPercent(getTargetOffset(initPage, isPortrait));
          onPageChangeRef.current?.(initPage, totalPhysicalPages);
          onOrientationChangeRef.current?.(isPortrait);
        });

        pageFlipInstance.on('changeState', (e: { data: string }) => {
          // Track fold depth to dynamically deepen inner edge shadows
          startFoldTracking(e.data);

          // When state transitions into 'flipping' or 'user_fold', the physical page lift / animation starts immediately
          if (e.data === 'flipping' || e.data === 'user_fold') {
            pageFlipAudio.playPageTurn();
            triggerFlipParticles(lastFlipDirectionRef.current);

            // Anticipate target spread position during fold/flip
            const cur = pageFlipInstance.getCurrentPageIndex();
            if (!isPortrait) {
              if (cur === 0 && lastFlipDirectionRef.current === 'next') {
                setOffsetPercent(0);
              } else if (cur <= 2 && lastFlipDirectionRef.current === 'prev') {
                setOffsetPercent(-25);
              } else if (cur >= totalPhysicalPages - 3 && lastFlipDirectionRef.current === 'next') {
                setOffsetPercent(25);
              } else if (cur >= totalPhysicalPages - 1 && lastFlipDirectionRef.current === 'prev') {
                setOffsetPercent(0);
              }
            }
          } else if (e.data === 'read') {
            // Settle into exact resting position when page animation completes or fold released
            const cur = pageFlipInstance.getCurrentPageIndex();
            setOffsetPercent(getTargetOffset(cur, isPortrait));
          }
        });

        pageFlipInstance.on('flip', (e: { data: number }) => {
          const newPage = typeof e.data === 'number' ? e.data : 0;
          const oldPage = currentPageRef.current;
          if (newPage > oldPage) {
            lastFlipDirectionRef.current = 'next';
          } else if (newPage < oldPage) {
            lastFlipDirectionRef.current = 'prev';
          }
          setCurrentPage(newPage);
          currentPageRef.current = newPage;
          setOffsetPercent(getTargetOffset(newPage, isPortrait));
          setHasInteracted(true);
          // Safety fallback: if not already triggered at animation onset, playPageTurn & particles (debounced)
          pageFlipAudio.playPageTurn();
          triggerFlipParticles(lastFlipDirectionRef.current);
          triggerBloomPulse(750);
          onPageChangeRef.current?.(newPage, totalPhysicalPages);
          if (newPage === 0) {
            onViewModeChangeRef.current?.('spread');
          }
        });

        pageFlipInstance.on('changeOrientation', (e: { data: string }) => {
          const isPort = e.data === 'portrait';
          setIsPortraitMode(isPort);
          setOffsetPercent(getTargetOffset(currentPageRef.current, isPort));
          onOrientationChangeRef.current?.(isPort);
        });

        // Load pages into PageFlip
        pageFlipInstance.loadFromHTML(clonedPages);
        pageFlipRef.current = pageFlipInstance;

        // Restore target page
        if (currentPageRef.current > 0) {
          try {
            pageFlipInstance.turnToPage(currentPageRef.current);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to initialize PageFlip:', err);
        setIsLoaded(true);
      }
    }, [pages, settings, totalPhysicalPages, viewMode, triggerFlipParticles, startFoldTracking, triggerBloomPulse, getTargetOffset]);

    useEffect(() => {
      // Delay slightly for initial layout stability
      const timer = setTimeout(() => {
        initFlipBook();
      }, 50);

      // Resize & orientation listener: re-init if window dimensions change noticeably
      let resizeTimer: NodeJS.Timeout;
      let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      let lastHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

      const handleResize = () => {
        const curWidth = window.innerWidth;
        const curHeight = window.innerHeight;
        if (Math.abs(curWidth - lastWidth) > 15 || Math.abs(curHeight - lastHeight) > 15) {
          lastWidth = curWidth;
          lastHeight = curHeight;
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            initFlipBook();
          }, 150);
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        clearTimeout(timer);
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        if (foldAnimRef.current) {
          cancelAnimationFrame(foldAnimRef.current);
        }
        if (bloomPulseTimerRef.current) {
          clearTimeout(bloomPulseTimerRef.current);
        }
        if (pageFlipRef.current) {
          try {
            pageFlipRef.current.destroy();
          } catch {
            // ignore
          }
          pageFlipRef.current = null;
        }
      };
    }, [initFlipBook]);

    // Track active page dragging continuously to sync gilt edge glow intensity via Framer Motion
    useEffect(() => {
      const handleWindowPointerMove = (e: MouseEvent | TouchEvent) => {
        if (foldStateRef.current === 'user_fold') {
          const clientX =
            'touches' in e && (e as TouchEvent).touches[0]
              ? (e as TouchEvent).touches[0].clientX
              : (e as MouseEvent).clientX;
          const deltaX = Math.abs(clientX - dragStartPosRef.current.x);
          const prog = Math.min(Math.max(deltaX / (pageWidth * 0.8), 0.08), 1.0);
          setDragProgress((prev) => Math.max(prev, prog));
        }
      };

      const handleWindowPointerUp = () => {
        setTimeout(() => {
          if (foldStateRef.current !== 'user_fold') {
            setIsDragging(false);
            setDragProgress(0);
          }
        }, 60);
      };

      window.addEventListener('pointermove', handleWindowPointerMove as EventListener);
      window.addEventListener('pointerup', handleWindowPointerUp as EventListener);
      window.addEventListener('touchend', handleWindowPointerUp as EventListener);

      return () => {
        window.removeEventListener('pointermove', handleWindowPointerMove as EventListener);
        window.removeEventListener('pointerup', handleWindowPointerUp as EventListener);
        window.removeEventListener('touchend', handleWindowPointerUp as EventListener);
      };
    }, [pageWidth]);

    return (
      <div
        ref={stageRef}
        className="relative w-full flex flex-col items-center justify-center my-auto"
      >
        {/* Render offscreen so React mounts elements with real dimensions before cloning */}
        <div
          ref={stagingRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: `${pageWidth}px`,
            height: `${pageHeight}px`,
            visibility: 'hidden',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Page 0: Front Cover */}
          <PageCover onOpenClick={handleNext} showHint={!hasInteracted} />

          {/* Interior Pages: 1 to N */}
          {pages.map((p, idx) => (
            <PageInside
              key={p.pageNumber || idx}
              pageData={p}
              isLeftPage={idx % 2 === 0}
              currencySymbol={settings.currencySymbol}
              isSinglePage={isPortraitMode}
              isMobile={isInitialPhone || pageWidth < 350 || isPortraitMode}
            />
          ))}

          {/* Page N+1: Back Cover */}
          <PageBackCover
            settings={settings}
            onReturnToCover={() => {
              setOffsetPercent(getTargetOffset(0, isPortraitMode));
              pageFlipRef.current?.turnToPage(0);
            }}
          />
        </div>

        {/* 3D Spatial Modern Zoom Viewport */}
        <div
          ref={zoomViewportRef}
          className="relative w-full flex items-center justify-center"
          style={{
            perspective: '2400px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 3D Camera Transformed Stage: Dolly in Z and Scale */}
          <div
            className="relative flex items-center justify-center will-change-transform"
            style={{
              transform: `translateZ(${(currentZoom - 1) * 120}px) scale3d(${currentZoom}, ${currentZoom}, 1)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* 3D Physical Book Arena - dynamically centered in viewport for both phone and normal screen */}
            <div
              className="relative flex items-center justify-center mx-auto py-1 px-0 sm:px-2 max-w-full"
              style={{
                width: isPortraitMode ? `${pageWidth}px` : `${pageWidth * 2}px`,
                transform: `translateX(${offsetPercent}%)`,
                transition: 'transform 650ms cubic-bezier(0.33, 1, 0.68, 1)',
                willChange: 'transform',
              }}
            >
              {/* Ambient Wood Table Drop Shadow & Warm Glow positioned under active visible pages */}
              <div
                className="absolute bottom-0 top-6 bg-black/60 blur-3xl rounded-3xl pointer-events-none -z-10 transition-all duration-650 ease-out"
                style={
                  !isPortraitMode && offsetPercent === -25
                    ? { left: '50%', right: '0%' }
                    : !isPortraitMode && offsetPercent === 25
                    ? { left: '0%', right: '50%' }
                    : { left: '2rem', right: '2rem' }
                }
              />

              {/* Physical Stacked Page Edges (shown on tablet and desktop when book is open in landscape) */}
              {currentPage > 0 && currentPage < totalPhysicalPages - 1 && !isPortraitMode && (
                <div className="hidden sm:block">
                  {/* Left page stack thickness */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-[96%] bg-[#e0d3c1] rounded-l-xs border-l border-y border-[#ab957f]/50 pointer-events-none -z-10 shadow-md"
                    style={{
                      left: `calc(50% - ${pageWidth}px - 7px)`,
                      backgroundImage:
                        'repeating-linear-gradient(to bottom, #d4c4b0 0px, #d4c4b0 1px, #f2e9dc 1px, #f2e9dc 3px)',
                    }}
                  />
                  {/* Right page stack thickness */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-[96%] bg-[#e0d3c1] rounded-r-xs border-r border-y border-[#ab957f]/50 pointer-events-none -z-10 shadow-md"
                    style={{
                      right: `calc(50% - ${pageWidth}px - 7px)`,
                      backgroundImage:
                        'repeating-linear-gradient(to bottom, #d4c4b0 0px, #d4c4b0 1px, #f2e9dc 1px, #f2e9dc 3px)',
                    }}
                  />
                </div>
              )}

              {/* Prominent Floating Left Page Turn Button */}
              {currentPage > 0 && (
                <button
                  onClick={handlePrev}
                  aria-label="Previous Page"
                  title="Previous Page (Left Arrow)"
                  className="flex absolute left-0 sm:-left-12 md:-left-16 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 items-center justify-center rounded-full bg-[#1c1715]/90 hover:bg-[#c49752] text-[#e8dfd5] hover:text-[#120f0e] border border-[#c49752]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Mount Container & 3D Particles for PageFlip */}
              <div className="relative flex justify-center items-center">
                {/* Mount Container for PageFlip with luxury glowing CSS bloom drop-shadow */}
                <div
                  ref={containerRef}
                  className={`select-none flex justify-center items-center relative z-10 ${
                    isBloomPulsing ? 'flipbook-bloom-pulse' : 'flipbook-bloom-resting'
                  }`}
                  style={{
                    minWidth: isPortraitMode ? `${pageWidth}px` : `${pageWidth * 2}px`,
                    minHeight: `${pageHeight}px`,
                  }}
                />

                {/* Soft, Dynamic Inner Edge Drop Shadow on central gutter spine that deepens as page folds */}
                {currentPage > 0 && currentPage < totalPhysicalPages - 1 && !isPortraitMode && (
                  <div
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 pointer-events-none z-25 flex items-center justify-center transition-all duration-100 ease-out"
                    style={{
                      width: `${Math.round(28 + foldDepth * 36)}px`,
                      height: `${pageHeight}px`,
                    }}
                  >
                    {/* Left Page Inner Edge Drop Shadow */}
                    <div
                      className="w-1/2 h-full pointer-events-none transition-opacity duration-100"
                      style={{
                        background: `linear-gradient(to left, 
                          rgba(12, 8, 5, ${0.30 + foldDepth * 0.48}) 0%, 
                          rgba(20, 13, 8, ${(0.30 + foldDepth * 0.48) * 0.65}) 35%, 
                          rgba(32, 20, 12, ${(0.30 + foldDepth * 0.48) * 0.25}) 70%, 
                          transparent 100%)`,
                      }}
                    />
                    {/* Right Page Inner Edge Drop Shadow */}
                    <div
                      className="w-1/2 h-full pointer-events-none transition-opacity duration-100"
                      style={{
                        background: `linear-gradient(to right, 
                          rgba(12, 8, 5, ${0.30 + foldDepth * 0.48}) 0%, 
                          rgba(20, 13, 8, ${(0.30 + foldDepth * 0.48) * 0.65}) 35%, 
                          rgba(32, 20, 12, ${(0.30 + foldDepth * 0.48) * 0.25}) 70%, 
                          transparent 100%)`,
                      }}
                    />
                    {/* Deep Binding Slit Contact Crease */}
                    <div
                      className="absolute inset-y-0 w-[1.5px] bg-[#0c0806] pointer-events-none"
                      style={{
                        opacity: 0.55 + foldDepth * 0.4,
                        boxShadow: `0 0 ${4 + foldDepth * 8}px rgba(0,0,0,${0.5 + foldDepth * 0.4})`,
                      }}
                    />
                  </div>
                )}

                {/* Subtle 3D Edge Particle Effect during Page Flip Animation */}
                <PageFlipParticles
                  trigger={particleTrigger}
                  bookWidth={isPortraitMode ? pageWidth : pageWidth * 2}
                  bookHeight={pageHeight}
                  isPortrait={isPortraitMode}
                />

                {/* Subtle, animated gold 'gilt' edge glow effect during active page dragging */}
                <GiltEdgeGlow
                  isDragging={isDragging}
                  dragProgress={dragProgress}
                  dragDirection={dragDirection}
                  bookWidth={isPortraitMode ? pageWidth : pageWidth * 2}
                  bookHeight={pageHeight}
                  isPortrait={isPortraitMode}
                />
              </div>

              {/* Prominent Floating Right Page Turn Button */}
              {currentPage < totalPhysicalPages - 1 && (
                <button
                  onClick={handleNext}
                  aria-label="Next Page"
                  title="Next Page (Right Arrow)"
                  className="flex absolute right-0 sm:-right-12 md:-right-16 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 items-center justify-center rounded-full bg-[#1c1715]/90 hover:bg-[#c49752] text-[#e8dfd5] hover:text-[#120f0e] border border-[#c49752]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading Indicator before book initializes */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#141110]/80 backdrop-blur-sm z-40">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-8 h-8 border-2 border-[#c49752] border-t-transparent rounded-full animate-spin" />
              <p className="font-serif italic text-sm text-[#ebd8be] tracking-wider">
                Preparing luxury menu book...
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FlipBook.displayName = 'FlipBook';
