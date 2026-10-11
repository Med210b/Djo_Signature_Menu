import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { MenuPageData } from '../types/menu';

interface TableOfContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: MenuPageData[];
  currentPage: number;
  onSelectPage: (pageIndex: number) => void;
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  isOpen,
  onClose,
  pages,
  currentPage,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  // Build TOC items list:
  // 0: Front Cover
  // 1..N: Interior Pages
  // N+1: Back Cover
  const items = [
    { title: 'Front Cover', subtitle: 'Menu Cover Presentation', pageIndex: 0 },
    ...pages.map((p, idx) => ({
      title: p.title || `Page ${p.pageNumber}`,
      subtitle: p.subtitle || (p.layout === 'welcome' ? 'Welcome & Hospitality' : ''),
      pageIndex: idx + 1,
    })),
    { title: 'Back Cover', subtitle: 'Reservations & Opening Hours', pageIndex: pages.length + 1 },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="toc-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#1a1513] border border-[#c49752]/30 rounded-lg shadow-2xl p-4 sm:p-8 text-[#e3d7c7] overflow-hidden">
        {/* Background decorative corner frame */}
        <div className="absolute inset-2 border border-[#c49752]/15 pointer-events-none rounded" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#c49752]/20">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#c49752]" />
            <h3 id="toc-heading" className="font-serif text-base sm:text-xl font-bold tracking-widest uppercase text-[#f4ebd0]">
              Table of Contents
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#a89785] hover:text-[#f4ebd0] hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* List of sections */}
        <div className="mt-3 sm:mt-4 max-h-[60vh] overflow-y-auto space-y-1 sm:space-y-1.5 pr-1 scrollbar-thin">
          {items.map((item) => {
            const isSelected = currentPage === item.pageIndex;
            return (
              <button
                key={item.pageIndex}
                onClick={() => {
                  onSelectPage(item.pageIndex);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2 sm:p-3 rounded text-left transition-all group ${
                  isSelected
                    ? 'bg-[#c49752]/20 border border-[#c49752]/40 text-[#f4ebd0]'
                    : 'hover:bg-white/5 text-[#d6c7b6]'
                }`}
              >
                <div className="min-w-0 pr-2 sm:pr-3">
                  <p className="font-serif text-xs sm:text-base font-semibold tracking-wide text-[#ebd8be] group-hover:text-[#f4ebd0] truncate">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="font-serif italic text-[10px] sm:text-xs text-[#a08a74] truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right font-serif text-[10px] sm:text-xs tracking-widest text-[#c49752] tabular-nums">
                  {item.pageIndex === 0
                    ? 'Cover'
                    : item.pageIndex === items.length - 1
                    ? 'End'
                    : `p. ${item.pageIndex}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#c49752]/20 text-center">
          <p className="font-serif text-xs text-[#8c7764] italic">
            Select any section to turn directly to that page
          </p>
        </div>
      </div>
    </div>
  );
};
