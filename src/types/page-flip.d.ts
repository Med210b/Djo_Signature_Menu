declare module 'page-flip' {
  export interface PageFlipSettings {
    startPage?: number;
    size?: 'fixed' | 'stretch';
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface PageFlipEvent<T = unknown> {
    data: T;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings);
    destroy(): void;
    update(): void;
    loadFromHTML(items: HTMLElement[] | NodeListOf<HTMLElement>): void;
    loadFromImages(images: string[]): void;
    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(pageIndex: number): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(pageIndex: number, corner?: 'top' | 'bottom'): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): 'portrait' | 'landscape';
    getState(): string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: 'flip' | 'changeState' | 'changeOrientation' | 'init', callback: (e: PageFlipEvent<any>) => void): PageFlip;
    off(event: string): void;
  }
}
