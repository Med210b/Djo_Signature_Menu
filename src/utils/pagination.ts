import { MenuCategory, MenuItem, MenuPageData, MenuBookSettings } from '../types/menu';
import { DRINK_DECOR_ASSETS } from '../data/menuData';

/**
 * Calculates item capacity score for interior pages.
 */
function getItemWeight(name: string, description?: string): number {
  const descLength = description ? description.length : 0;
  if (descLength > 120) return 1.35;
  if (descLength > 60) return 1.1;
  return 0.9;
}

const MAX_PAGE_WEIGHT = 4.8;

/**
 * Generates an array of interior MenuPageData from categories and settings.
 * Ensures the user's authentic pages (Hot Drinks, Cold Drinks, Special Drinks)
 * are placed in the exact requested sequence, followed by any additional categories.
 */
export function generateMenuPages(
  categories: MenuCategory[],
  settings: MenuBookSettings
): MenuPageData[] {
  const pages: MenuPageData[] = [];
  let pageCounter = 1;

  // PAGE 1: FIRST PAGE DIRECT WHEN WE OPEN THE BOOK (matches user provided image fbdfdf_ciyxz0.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'intro-page',
    title: 'WELCOME',
    subtitle: 'Djo Signature',
    quotation: {
      text: 'Coffee – the favorite drink of the civilized world.',
      author: 'Thomas Jefferson',
    },
    decorImages: [],
  });

  // Find user's core drink categories
  const hotDrinksCat = categories.find((c) => c.id === 'hot-drinks');
  const coldDrinksCat = categories.find((c) => c.id === 'cold-drinks');
  const specialDrinksCat = categories.find((c) => c.id === 'special-drinks');

  // PAGE 2: HOT DRINKS (matches user reference image 1_hbsxpd.png)
  if (hotDrinksCat) {
    pages.push({
      pageNumber: pageCounter++,
      layout: 'hot-drinks',
      title: 'HOT DRINKS',
      subtitle: '',
      quotation: {
        text: 'Coffee – the favorite drink of the civilized world.',
        author: 'Thomas Jefferson',
      },
      singleCategory: hotDrinksCat,
      categories: [hotDrinksCat],
      decorImages: [],
    });
  }

  // PAGE 3: COLD DRINKS (matches user reference image 2_v6jow3.png)
  if (coldDrinksCat) {
    pages.push({
      pageNumber: pageCounter++,
      layout: 'cold-drinks',
      title: 'COLD DRINKS',
      subtitle: coldDrinksCat.subtitle || 'Natural Juices, Smoothies & Refreshing Mojitos',
      quotation: {
        text: 'Water is the driving force of all nature.',
        author: 'Leonardo da Vinci',
      },
      singleCategory: coldDrinksCat,
      categories: [coldDrinksCat],
      decorImages: [
        {
          url: DRINK_DECOR_ASSETS.orangeJuice,
          alt: 'Freshly Pressed Citrus Juice',
          position: 'top-left',
        },
        {
          url: DRINK_DECOR_ASSETS.mojito,
          alt: 'Refreshing Mint & Lime Mojito',
          position: 'bottom-right',
        },
      ],
    });
  }

  // PAGE 3: SPECIAL DRINKS
  if (specialDrinksCat) {
    pages.push({
      pageNumber: pageCounter++,
      layout: 'special-drinks',
      title: 'SPECIAL DRINKS',
      subtitle: specialDrinksCat.subtitle || 'Signature Milkshakes, Healthy Creations & Extras',
      quotation: {
        text: 'Take care of your body. It’s the only place you have to live.',
        author: 'Jim Rohn',
      },
      singleCategory: specialDrinksCat,
      categories: [specialDrinksCat],
      extrasNote: 'Whipped cream, dried fruit, dried fruit Bueno, Kinder, Oreo, Nutella, chocolate',
      decorImages: [
        {
          url: DRINK_DECOR_ASSETS.milkshake,
          alt: 'Gourmet Chocolate Shake',
          position: 'right-side',
        },
        {
          url: DRINK_DECOR_ASSETS.granolaHealthy,
          alt: 'Artisan Healthy Granola',
          position: 'bottom-left',
        },
      ],
    });
  }

  // PAGE 4: FROZEN AND FRESH (matches user provided image 4_zhkk2m.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'frozen-and-fresh',
    title: 'FROZEN AND FRESH',
    subtitle: 'Signature Frozen & Fresh Refreshments',
    quotation: {
      text: 'Nature always wears the colors of the spirit.',
      author: 'Ralph Waldo Emerson',
    },
    decorImages: [],
  });

  // PAGE 5: DESSERTS AND MORE (matches user provided image 6_wepjn3.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'desserts-and-more',
    title: 'DESSERTS & MORE',
    subtitle: 'Artisan Confections & Sweet Delights',
    decorImages: [],
  });

  // PAGE 6: MATCHA (matches user provided image 7_ys91fv.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'matcha',
    title: 'MATCHA',
    subtitle: 'Ceremonial Grade Japanese Green Tea',
    decorImages: [],
  });

  // PAGE 7: MOCKTAILS (matches user provided image 8_mgptfb.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'mocktails',
    title: 'MOCKTAILS',
    subtitle: 'Handcrafted Botanical & Citrus Blends',
    decorImages: [],
  });

  // PAGE 8: (matches user provided image 10_donjdw.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'page-10',
    title: 'Signature Creations',
    subtitle: 'Artisanal Selection',
    decorImages: [],
  });

  // PAGE 9: (matches user provided image 11_facqmf.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'page-11',
    title: 'Signature Selection',
    subtitle: 'Artisanal Selection',
    decorImages: [],
  });

  // PAGE 10: (matches user provided image 12_yafhoi.png)
  pages.push({
    pageNumber: pageCounter++,
    layout: 'page-12',
    title: 'Signature Delights',
    subtitle: 'Artisanal Selection',
    decorImages: [],
  });

  // Any other custom categories added by the user in the editor
  const otherCategories = categories.filter(
    (c) =>
      c.id !== 'hot-drinks' &&
      c.id !== 'cold-drinks' &&
      c.id !== 'special-drinks' &&
      c.id !== 'frozen-and-fresh' &&
      c.id !== 'desserts-and-more' &&
      c.id !== 'matcha' &&
      c.id !== 'mocktails' &&
      c.id !== 'page-10' &&
      c.id !== 'page-11' &&
      c.id !== 'page-12'
  );

  for (const category of otherCategories) {
    if (!category.items || category.items.length === 0) continue;

    let currentItems: MenuItem[] = [];
    let currentWeight = 0;
    let partIndex = 1;

    for (let i = 0; i < category.items.length; i++) {
      const item = category.items[i];
      const itemWeight = getItemWeight(item.name, item.description);

      if (currentWeight + itemWeight > MAX_PAGE_WEIGHT && currentItems.length > 0) {
        pages.push({
          pageNumber: pageCounter++,
          layout: 'single-category',
          title: partIndex > 1 ? `${category.title} (Cont.)` : category.title,
          subtitle: category.subtitle,
          singleCategory: {
            ...category,
            title: partIndex > 1 ? `${category.title} (Cont.)` : category.title,
            items: currentItems,
          },
        });
        currentItems = [item];
        currentWeight = itemWeight;
        partIndex++;
      } else {
        currentItems.push(item);
        currentWeight += itemWeight;
      }
    }

    if (currentItems.length > 0) {
      pages.push({
        pageNumber: pageCounter++,
        layout: 'single-category',
        title: partIndex > 1 ? `${category.title} (Cont.)` : category.title,
        subtitle: category.subtitle,
        singleCategory: {
          ...category,
          title: partIndex > 1 ? `${category.title} (Cont.)` : category.title,
          items: currentItems,
        },
      });
    }
  }

  // RESTORED PAGE: MENU DIRECTORY (Table of Contents / Index)
  // Replaces previous placeholder with menu page names & numbers requested by user:
  // e.g. Hot Drinks : Page 1, Cold Drinks : Page 2, ...
  pages.push({
    pageNumber: pageCounter++,
    layout: 'menu-directory',
    title: 'MENU DIRECTORY',
    subtitle: 'Table of Contents & Quick Navigation',
    quotation: {
      text: 'Good food and noble drinks bring people together.',
      author: 'Djo Signature',
    },
    decorImages: [],
  });

  return pages;
}
