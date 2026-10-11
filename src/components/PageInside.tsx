import React from 'react';
import { MenuPageData, MenuItem } from '../types/menu';
import { MENU_ASSETS } from '../data/menuData';

interface PageInsideProps {
  pageData: MenuPageData;
  isLeftPage?: boolean;
  currencySymbol?: string;
  isSinglePage?: boolean;
}

export const PageInside: React.FC<PageInsideProps> = ({
  pageData,
  isLeftPage = false,
  currencySymbol = '',
  isSinglePage = false,
}) => {
  // Format price helper: clean numbers only, NO DH
  const formatPrice = (priceStr: string) => {
    if (!priceStr) return '';
    // If currencySymbol is explicitly empty or prices already formatted
    if (!currencySymbol) return priceStr;
    return `${priceStr} ${currencySymbol}`;
  };

  return (
    <div
      className="page page-inside relative w-full h-full bg-[#f4ebe1] select-none overflow-hidden"
      data-density="soft"
    >
      {/* 1. Exact mandatory Rococo parchment background */}
      <img
        src={MENU_ASSETS.parchment}
        alt="Rococo Parchment Background"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* 2. Soft, dynamic drop shadow effect on the inner edges & paper thickness bevel */}
      {isSinglePage ? (
        <>
          {/* Inner paper edge thickness bevel (3D caliper highlight) */}
          <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/15 via-white/35 to-white/15 pointer-events-none z-30" />
          {/* Deep inner binding seam contact shadow */}
          <div className="absolute inset-y-0 left-0 w-2.5 pointer-events-none z-25 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
          {/* Dynamic inner drop shadow that deepens as the page folds */}
          <div
            className="inner-edge-fold-shadow absolute inset-y-0 left-0 pointer-events-none z-22 transition-all duration-150 ease-out"
            style={{
              width: 'var(--inner-edge-shadow-width, 32px)',
              background:
                'linear-gradient(to right, rgba(14, 9, 5, var(--inner-edge-shadow-opacity, 0.28)) 0%, rgba(24, 15, 9, calc(var(--inner-edge-shadow-opacity, 0.28) * 0.7)) 35%, rgba(38, 24, 14, calc(var(--inner-edge-shadow-opacity, 0.28) * 0.28)) 70%, transparent 100%)',
            }}
          />
          {/* Soft curvature ambient occlusion shadow */}
          <div
            className="inner-edge-ambient-shadow absolute inset-y-0 left-0 pointer-events-none z-20 transition-all duration-150 ease-out"
            style={{
              width: 'var(--inner-edge-ambient-width, 56px)',
              background:
                'linear-gradient(to right, rgba(18, 12, 7, calc(var(--inner-edge-shadow-opacity, 0.26) * 0.45)) 0%, transparent 100%)',
            }}
          />
        </>
      ) : isLeftPage ? (
        <>
          {/* Inner paper edge thickness bevel (3D caliper highlight) */}
          <div className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-white/15 via-white/35 to-white/15 pointer-events-none z-30" />
          {/* Deep inner binding seam contact shadow */}
          <div className="absolute inset-y-0 right-0 w-2.5 pointer-events-none z-25 bg-gradient-to-l from-black/55 via-black/25 to-transparent" />
          {/* Dynamic inner drop shadow that deepens as the page folds */}
          <div
            className="inner-edge-fold-shadow absolute inset-y-0 right-0 pointer-events-none z-22 transition-all duration-150 ease-out"
            style={{
              width: 'var(--inner-edge-shadow-width, 34px)',
              background:
                'linear-gradient(to left, rgba(14, 9, 5, var(--inner-edge-shadow-opacity, 0.28)) 0%, rgba(24, 15, 9, calc(var(--inner-edge-shadow-opacity, 0.28) * 0.7)) 35%, rgba(38, 24, 14, calc(var(--inner-edge-shadow-opacity, 0.28) * 0.28)) 70%, transparent 100%)',
            }}
          />
          {/* Soft curvature ambient occlusion shadow */}
          <div
            className="inner-edge-ambient-shadow absolute inset-y-0 right-0 pointer-events-none z-20 transition-all duration-150 ease-out"
            style={{
              width: 'var(--inner-edge-ambient-width, 58px)',
              background:
                'linear-gradient(to left, rgba(18, 12, 7, calc(var(--inner-edge-shadow-opacity, 0.26) * 0.45)) 0%, transparent 100%)',
            }}
          />
        </>
      ) : (
        <>
          {/* Inner paper edge thickness bevel (3D caliper highlight) */}
          <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-white/15 via-white/35 to-white/15 pointer-events-none z-30" />
          {/* Deep inner binding seam contact shadow */}
          <div className="absolute inset-y-0 left-0 w-2.5 pointer-events-none z-25 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
          {/* Dynamic inner drop shadow that deepens as the page folds */}
          <div
            className="inner-edge-fold-shadow absolute inset-y-0 left-0 pointer-events-none z-22 transition-all duration-150 ease-out"
            style={{
              width: 'var(--inner-edge-shadow-width, 34px)',
              background:
                'linear-gradient(to right, rgba(14, 9, 5, var(--inner-edge-shadow-opacity, 0.28)) 0%, rgba(24, 15, 9, calc(var(--inner-edge-shadow-opacity, 0.28) * 0.7)) 35%, rgba(38, 24, 14, calc(var(--inner-edge-shadow-opacity, 0.28) * 0.28)) 70%, transparent 100%)',
            }}
          />
          {/* Soft curvature ambient occlusion shadow */}
          <div
            className="inner-edge-ambient-shadow absolute inset-y-0 left-0 pointer-events-none z-20 transition-all duration-150 ease-out"
            style={{
              width: 'var(--inner-edge-ambient-width, 58px)',
              background:
                'linear-gradient(to right, rgba(18, 12, 7, calc(var(--inner-edge-shadow-opacity, 0.26) * 0.45)) 0%, transparent 100%)',
            }}
          />
        </>
      )}

      {/* 3. Subtle antique gold gilt edge trim along outer page margin */}
      {isSinglePage || !isLeftPage ? (
        <div className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-[#e5c07b]/25 via-[#f3d686]/40 to-[#e5c07b]/25 pointer-events-none z-20" />
      ) : (
        <div className="absolute inset-y-0 left-0 w-[1.5px] bg-gradient-to-b from-[#e5c07b]/25 via-[#f3d686]/40 to-[#e5c07b]/25 pointer-events-none z-20" />
      )}

      {/* 4. Subtle page corner vignette highlight */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_25px_rgba(80,50,20,0.08)] z-20" />

      {/* ========================================================================= */}
      {/* PAGE 1: INTRO / FIRST PAGE DIRECT WHEN WE OPEN THE BOOK                   */}
      {/* ========================================================================= */}
      {pageData.layout === 'intro-page' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.introPage}
            alt="Welcome to Djo Signature"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'hot-drinks' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.hotDrinksPage}
            alt="Hot Drinks"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'cold-drinks' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.coldDrinksPage}
            alt="Cold Drinks"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'special-drinks' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.specialDrinksPage}
            alt="Special Drinks"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'frozen-and-fresh' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.frozenAndFreshPage}
            alt="Frozen and Fresh"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'desserts-and-more' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.dessertsAndMorePage}
            alt="Desserts and More"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'matcha' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.matchaPage}
            alt="Matcha"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'mocktails' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.mocktailsPage}
            alt="Mocktails"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'page-10' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.page10}
            alt="Signature Creations"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'page-11' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.page11}
            alt="Signature Selection"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'page-12' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.page12}
            alt="Signature Delights"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : pageData.layout === 'menu-directory' ? (
        <div className="relative z-10 w-full h-full select-none overflow-hidden flex items-center justify-center">
          <img
            src={MENU_ASSETS.menuDirectory}
            alt="Menu Directory"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
          />
        </div>
      ) : (
        /* ========================================================================= */
        /* OTHER PAGES: COLD DRINKS, SPECIAL DRINKS, SPECIALTIES                     */
        /* ========================================================================= */
        <div className="relative z-10 w-full h-full flex flex-col justify-between px-[6.5%] sm:px-[8%] pt-[5.5%] sm:pt-[6.5%] pb-[4.5%] select-none">
          {/* Header Quotation & Title in Harmonious Brand System */}
          <header className="shrink-0 mb-1">
            {pageData.quotation && (
              <div className="w-[92%] mx-auto px-3 sm:px-5 py-1.5 sm:py-2 border border-[#8d8d7a]/60 rounded-xs relative bg-[#faf4ec]/25 mb-1.5">
                <p
                  className="text-center font-carrera-script leading-tight"
                  style={{
                    color: '#975f31',
                    fontFamily: "'carrera script', 'Carrera Script', 'Alex Brush', 'Great Vibes', 'Allura', cursive",
                    fontSize: 'clamp(13px, 4.2cqi, 38px)',
                    lineHeight: 1.15,
                  }}
                >
                  “{pageData.quotation.text}”
                </p>
                <p
                  className="text-right font-gormorant italic mt-0.5"
                  style={{
                    color: '#975f31',
                    fontFamily: "'gormorant gormorand', 'Cormorant Garamond', Georgia, serif",
                    fontSize: 'clamp(7.5px, 1.8cqi, 18px)',
                    lineHeight: 1.2,
                  }}
                >
                  — {pageData.quotation.author}
                </p>
              </div>
            )}

            {pageData.title && (
              <div className="text-center my-0.5 sm:my-1">
                <h2
                  className="font-ahsing uppercase tracking-[0.12em]"
                  style={{
                    color: '#975f31',
                    fontFamily: "'Ahsing', 'Rozha One', 'Abril Fatface', 'Playfair Display', serif",
                    fontSize: 'clamp(14px, 4.4cqi, 44px)',
                    lineHeight: 1.15,
                  }}
                >
                  {pageData.title}
                </h2>
              </div>
            )}
          </header>

          {/* Main Content Area */}
          <main className="grow flex flex-col justify-center overflow-hidden my-auto py-0.5">
            {/* ------------------------------------------------------- */}
            {/* GENERAL SINGLE CATEGORY (FOR ANY CUSTOM ADDED PAGES)    */}
            {/* ------------------------------------------------------- */}
            {pageData.layout === 'single-category' && pageData.singleCategory && (
              <div className="flex flex-col justify-around gap-1.5 sm:gap-2.5">
                {pageData.singleCategory.items.map((item: MenuItem) => (
                  <div key={item.id} className="group transition-opacity">
                    <div className="flex items-baseline justify-between gap-1 border-b border-[#c4a98a]/30 pb-0.5">
                      <span className="font-serif font-semibold text-[9.5px] sm:text-xs md:text-sm text-[#2c211b] tracking-wide truncate">
                        {item.name}
                      </span>
                      <span className="font-serif font-semibold text-[9px] sm:text-xs md:text-sm text-[#2e221b] tabular-nums shrink-0 ml-1">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="font-serif italic text-[8px] sm:text-[10px] text-[#5e4b3e] leading-snug mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Footer Page Number */}
          <footer className="shrink-0 text-center pt-0.5">
            <div className="inline-flex items-center justify-center gap-1.5 text-[8.5px] sm:text-[10px] font-serif italic text-[#846b57]">
              <span>~</span>
              <span>{pageData.pageNumber}</span>
              <span>~</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};
