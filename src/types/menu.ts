export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  note?: string; // e.g. "(Caramel, chocolat, vanille, noisette, spéculos)" or "(Extra)"
  dietaryTags?: string[]; // e.g. ['V', 'GF', 'DF']
  pairingOrNotes?: string;
  isHighlight?: boolean;
}

export interface MenuCategory {
  id: string;
  title: string;
  subtitle?: string;
  note?: string; // e.g. "Served with house-churned butter and artisanal sourdough"
  items: MenuItem[];
}

export type PageLayoutType = 
  | 'cover'
  | 'welcome'
  | 'intro-page'
  | 'hot-drinks'
  | 'cold-drinks'
  | 'special-drinks'
  | 'frozen-and-fresh'
  | 'desserts-and-more'
  | 'matcha'
  | 'mocktails'
  | 'page-10'
  | 'page-11'
  | 'page-12'
  | 'menu-directory'
  | 'single-category'
  | 'multi-category'
  | 'featured-highlight'
  | 'beverages'
  | 'back-cover';

export interface PageQuotation {
  text: string;
  author: string;
}

export interface PageDecorImage {
  url: string;
  alt: string;
  position?: string;
  className?: string;
}

export interface MenuPageData {
  pageNumber: number; // 1-based index within the book
  layout: PageLayoutType;
  title?: string;
  subtitle?: string;
  quotation?: PageQuotation;
  categories?: MenuCategory[];
  singleCategory?: MenuCategory;
  decorImages?: PageDecorImage[];
  introText?: string;
  outroText?: string;
  extrasNote?: string;
  showLogo?: boolean;
}

export interface MenuBookSettings {
  restaurantName: string;
  tagline: string;
  currencySymbol: string;
  welcomeTitle: string;
  welcomeMessage: string;
  chefName?: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    hours: string;
    reservationNotice?: string;
  };
}
