import { MenuCategory, MenuBookSettings } from '../types/menu';

/**
 * ASSET CONSTANTS
 * Strict user requirement: Use provided assets without alteration or AI replacements.
 */
export const MENU_ASSETS = {
  logo: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791545505/Adobe_Express_-_file_nczg4o.png',
  cover: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791545489/retouch_2026100901280848_lb58f0.jpg',
  parchment: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791545488/Rococo_Garden_Parchment_Invitation_1_zgp88v.png',
  introPage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791573739/fbdfdf_ciyxz0.png',
  hotDrinksPage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791561928/1_hbsxpd.png',
  coldDrinksPage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791562620/2_v6jow3.png',
  specialDrinksPage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791580891/9_y2ssea.png',
  frozenAndFreshPage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791563398/4_zhkk2m.png',
  dessertsAndMorePage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791563479/6_wepjn3.png',
  matchaPage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791563478/7_ys91fv.png',
  mocktailsPage: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791563482/8_mgptfb.png',
  page10: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791573507/10_donjdw.png',
  page11: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791573509/11_facqmf.png',
  page12: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791573485/12_yafhoi.png',
  menuDirectory: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791676343/245464564_qi4gs6.png',
  backCover: 'https://res.cloudinary.com/swcgor0l/image/upload/v1791575057/mennnn_yzp09k.png',
};

/**
 * DECORATIVE BEVERAGE IMAGES
 * Matched to user reference: burlap coffee bean sack, white porcelain latte art cup & saucer.
 */
export const DRINK_DECOR_ASSETS = {
  // Hot drinks - matches reference image exactly:
  // 1. Spilling burlap coffee bean sack
  // 2. White cup with leaf latte art on saucer
  coffeeBeansSack: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500&q=80',
  latteArtCup: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80',

  // Cold drinks
  mojito: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=400&q=80',
  orangeJuice: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=400&q=80',
  smoothie: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80',

  // Special drinks
  milkshake: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80',
  cookiesChocolate: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80',
  granolaHealthy: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=400&q=80',
};

/**
 * INITIAL MENU SETTINGS & HOSPITALITY DETAILS
 * currencySymbol is empty string per user request: "remouve the DH from prices"
 */
export const initialMenuSettings: MenuBookSettings = {
  restaurantName: 'Djo Signature',
  tagline: 'Café & Haute Pâtisserie',
  currencySymbol: '', // Empty: clean numbers only, no DH
  welcomeTitle: 'BIENVENUE',
  welcomeMessage:
    'Experience the warmth of artisanal roasts, pressed nectars, and handcrafted confections in our Rococo lounge sanctuary.',
  chefName: 'Maison Barista',
  contactInfo: {
    address: 'Avenue de la Renaissance, Salon Privé',
    phone: '+212 5 22 00 11 22',
    email: 'contact@djosignature.com',
    hours: 'Monday – Sunday : 08:00 – 00:00',
    reservationNotice: 'Prices inclusive of service. Inform our baristas of any dairy or allergen preferences.',
  },
};

/**
 * THE 3 CORE MENU PAGES SPECIFIED BY THE USER:
 * 1. HOT DRINKS: Exactly matches user reference image (items, 2-column structure, prices, notes, quotes, decor)
 * 2. COLD DRINKS: Natural Juices, Smoothies, Mojito
 * 3. SPECIAL DRINKS: Milkshake, Healthy part, Extras
 */
export const initialMenuCategories: MenuCategory[] = [
  // ==========================================
  // PAGE 1: HOT DRINKS (EXACT TO ATTACHED IMAGE)
  // ==========================================
  {
    id: 'hot-drinks',
    title: 'HOT DRINKS',
    subtitle: '',
    note: '',
    items: [
      // Left Column Group 1
      {
        id: 'hd-1',
        name: 'Espresso single shot',
        price: '15',
      },
      {
        id: 'hd-2',
        name: 'Espresso double shot',
        price: '21/23',
      },
      {
        id: 'hd-3',
        name: 'Café mocha (hot/iced)',
        price: '25',
      },
      {
        id: 'hd-4',
        name: 'Café Americano',
        price: '20',
      },
      {
        id: 'hd-5',
        name: 'Capsule',
        price: '17',
      },

      // Left Column Group 2 (after spacing gap)
      {
        id: 'hd-6',
        name: 'Macchiato',
        price: '17',
      },
      {
        id: 'hd-7',
        name: 'Macchiato',
        price: '17',
      },
      {
        id: 'hd-8',
        name: 'Café latte',
        price: '23',
      },
      {
        id: 'hd-9',
        name: 'Cappuccino',
        price: '23',
      },
      {
        id: 'hd-10',
        name: 'Latte macchiato flavored',
        note: '(Caramel, chocolat, vanille, noisette, spéculos)',
        price: '23',
      },

      // Right Column
      {
        id: 'hd-11',
        name: 'Spanish latte',
        price: '24',
      },
      {
        id: 'hd-12',
        name: 'Hot chocolate',
        price: '27',
      },
      {
        id: 'hd-13',
        name: 'Hot Nutella',
        price: '24',
      },
      {
        id: 'hd-14',
        name: 'Hot lotus',
        price: '27',
      },
      {
        id: 'hd-15',
        name: 'Hot pistachio',
        price: '27',
      },
      {
        id: 'hd-16',
        name: 'Tisane',
        price: '27',
      },
      {
        id: 'hd-17',
        name: 'Tea infusion',
        price: '21',
      },
      {
        id: 'hd-18',
        name: 'Crème chantilly',
        note: '(Extra)',
        price: '21',
      },
    ],
  },

  // ==========================================
  // PAGE 2: COLD DRINKS
  // ==========================================
  {
    id: 'cold-drinks',
    title: 'COLD DRINKS',
    subtitle: 'Natural Juices, Smoothies & Refreshing Mojitos',
    note: 'Freshly pressed fruits, crushed ice, and garden mint',
    items: [
      // Natural Juices
      {
        id: 'cd-nj-1',
        name: 'Orange juice',
        pairingOrNotes: 'Natural Juices',
        description: '100% freshly pressed Valencia oranges',
        price: '24',
      },
      {
        id: 'cd-nj-2',
        name: 'Lemon juice',
        pairingOrNotes: 'Natural Juices',
        description: 'Fresh squeezed zesty lemon with garden mint leaves',
        price: '22',
      },
      {
        id: 'cd-nj-3',
        name: 'Seasonal fruit juice',
        pairingOrNotes: 'Natural Juices',
        description: 'Chef selection of today’s fresh market harvest',
        price: '26',
      },
      {
        id: 'cd-nj-4',
        name: 'Fruit cocktail',
        pairingOrNotes: 'Natural Juices',
        description: 'Layered fresh fruit purées with honey glaze',
        price: '30',
      },

      // Smoothies
      {
        id: 'cd-sm-1',
        name: 'Fruit',
        pairingOrNotes: 'Smoothies',
        description: 'Blended seasonal fruits with crushed ice and floral honey',
        price: '30',
      },
      {
        id: 'cd-sm-2',
        name: 'Strawberry banana',
        pairingOrNotes: 'Smoothies',
        description: 'Sun-ripened strawberries, sweet banana, and yogurt',
        price: '34',
      },
      {
        id: 'cd-sm-3',
        name: 'Blueberry',
        pairingOrNotes: 'Smoothies',
        description: 'Wild mountain blueberries and Greek yogurt',
        price: '36',
      },
      {
        id: 'cd-sm-4',
        name: 'Tropical',
        pairingOrNotes: 'Smoothies',
        description: 'Mango, passion fruit, pineapple, and coconut water',
        price: '35',
      },
      {
        id: 'cd-sm-5',
        name: 'Forest fruit',
        pairingOrNotes: 'Smoothies',
        description: 'Blackberries, raspberries, red berries blend',
        price: '36',
      },
      {
        id: 'cd-sm-6',
        name: 'Banana kiwi',
        pairingOrNotes: 'Smoothies',
        description: 'Sweet banana balanced with zesty green kiwi',
        price: '34',
      },

      // Mojito
      {
        id: 'cd-mj-1',
        name: 'Virgin',
        pairingOrNotes: 'Mojito',
        description: 'Crushed lime, fresh garden mint, cane sugar, sparkling soda',
        price: '28',
      },
      {
        id: 'cd-mj-2',
        name: 'Blue',
        pairingOrNotes: 'Mojito',
        description: 'Vibrant blue curaçao essence, lime, and crushed mint',
        price: '32',
      },
      {
        id: 'cd-mj-3',
        name: 'Red (Strawberry)',
        pairingOrNotes: 'Mojito',
        description: 'Fresh crushed strawberries, lime, mint, and fizzy tonic',
        price: '32',
      },
      {
        id: 'cd-mj-4',
        name: 'Pink (Rasberry)',
        pairingOrNotes: 'Mojito',
        description: 'Wild raspberry coulis, fresh lime slices, and sparkling soda',
        price: '32',
      },
      {
        id: 'cd-mj-5',
        name: 'Forest fruit',
        pairingOrNotes: 'Mojito',
        description: 'Wild woodland berries muddled with mint and citrus lime',
        price: '34',
      },
      {
        id: 'cd-mj-6',
        name: 'Wild berries',
        pairingOrNotes: 'Mojito',
        description: 'Dark blackberries and blue berries, crushed ice, and mint',
        price: '34',
      },
    ],
  },

  // ==========================================
  // PAGE 3: SPECIAL DRINKS
  // ==========================================
  {
    id: 'special-drinks',
    title: 'SPECIAL DRINKS',
    subtitle: 'Signature Milkshakes, Healthy Creations & Extras',
    note: 'Decadent shakes, power protein mixes, and customized toppings',
    items: [
      // Milkshakes
      {
        id: 'sd-ms-1',
        name: 'Chocolate',
        pairingOrNotes: 'Milkshake',
        description: 'Rich Dutch cocoa cream shake topped with whipped froth',
        price: '34',
      },
      {
        id: 'sd-ms-2',
        name: 'Nutella',
        pairingOrNotes: 'Milkshake',
        description: 'Pure Nutella hazelnut blended with cream and gelato',
        price: '36',
      },
      {
        id: 'sd-ms-3',
        name: 'Caramel',
        pairingOrNotes: 'Milkshake',
        description: 'Salted butter caramel drizzle with sweet cream gelato',
        price: '34',
      },
      {
        id: 'sd-ms-4',
        name: 'Banana',
        pairingOrNotes: 'Milkshake',
        description: 'Fresh banana blended with vanilla bean ice cream',
        price: '32',
      },
      {
        id: 'sd-ms-5',
        name: 'Vanilla',
        pairingOrNotes: 'Milkshake',
        description: 'Bourbon Madagascar vanilla bean churned milkshake',
        price: '32',
      },
      {
        id: 'sd-ms-6',
        name: 'Hazelnut',
        pairingOrNotes: 'Milkshake',
        description: 'Roasted Piedmont hazelnut paste and sweet cream',
        price: '36',
      },
      {
        id: 'sd-ms-7',
        name: 'Pistachio',
        pairingOrNotes: 'Milkshake',
        description: 'Pure roasted pistachio butter and artisan vanilla gelato',
        price: '38',
      },
      {
        id: 'sd-ms-8',
        name: 'Lotus',
        pairingOrNotes: 'Milkshake',
        description: 'Caramelized Lotus Biscoff biscuit crunch & cream',
        price: '38',
      },
      {
        id: 'sd-ms-9',
        name: 'Forest fruit',
        pairingOrNotes: 'Milkshake',
        description: 'Tart forest berries whipped with velvety sweet milk',
        price: '36',
      },
      {
        id: 'sd-ms-10',
        name: 'White chocolate',
        pairingOrNotes: 'Milkshake',
        description: 'Melted Belgian ivory chocolate and creamy whole milk',
        price: '36',
      },
      {
        id: 'sd-ms-11',
        name: 'Chocolate cookies',
        pairingOrNotes: 'Milkshake',
        description: 'Crunchy artisanal chocolate cookies blended in thick shake',
        price: '36',
      },
      {
        id: 'sd-ms-12',
        name: 'Chocolate Oreo',
        pairingOrNotes: 'Milkshake',
        description: 'Crushed Oreo cookies, vanilla ice cream, and chocolate ganache',
        price: '38',
      },

      // Healthy part
      {
        id: 'sd-hp-1',
        name: 'Lait de poule',
        pairingOrNotes: 'Healthy part',
        description: 'Traditional nourishing eggnog with warm spiced milk, honey & nutmeg',
        price: '28',
      },
      {
        id: 'sd-hp-2',
        name: 'Protein shake (40 g protein)',
        pairingOrNotes: 'Healthy part',
        description: '40g isolate whey protein, banana, almond milk, and chia seeds',
        price: '42',
      },
      {
        id: 'sd-hp-3',
        name: 'Granola',
        pairingOrNotes: 'Healthy part',
        description: 'Toasted organic oat granola bowl, honey, dried berries, Greek yogurt',
        price: '32',
      },

      // Extras
      {
        id: 'sd-ex-1',
        name: 'Extras (Toppings & Delights)',
        pairingOrNotes: 'Extras',
        description: 'Whipped cream, dried fruit, dried fruit Bueno, Kinder, Oreo, Nutella, chocolate',
        price: '6 – 10',
      },
    ],
  },
];
