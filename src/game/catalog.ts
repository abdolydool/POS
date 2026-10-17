import type { GroceryItem } from './registerLogic';

export interface CustomerOrder {
  id: string;
  customerName: string;
  avatar: string;
  dialogue: string;
  items: {
    item: GroceryItem;
    quantity: number;
    weight?: number; // for produce weighed on scale
  }[];
  couponCode?: string;
  cardName: string;
  cardNumber: string; // formatted with dots or asterisks
  cardType: 'Visa' | 'Mastercard' | 'Amex';
  cardExpiry: string;
  cardPin: string;
  paymentPreference: 'tap' | 'chip' | 'swipe';
}

export const GROCERY_CATALOG: GroceryItem[] = [
  // --- Produce (with official standard PLU codes & weight scale) ---
  {
    id: 'prod-banana',
    name: 'Organic Bananas',
    category: 'produce',
    price: 0.69, // per lb
    isWeighted: true,
    weight: 2.3,
    barcode: '000000004011',
    pluCode: '4011',
    emoji: '🍌',
    brand: 'Equator Organics',
    badge: 'PLU 4011',
  },
  {
    id: 'prod-honeycrisp',
    name: 'Honeycrisp Apples',
    category: 'produce',
    price: 1.99, // per lb
    isWeighted: true,
    weight: 1.6,
    barcode: '000000004173',
    pluCode: '4173',
    emoji: '🍎',
    brand: 'Orchard Valley',
    badge: 'PLU 4173',
  },
  {
    id: 'prod-avocado',
    name: 'Hass Avocado (Each)',
    category: 'produce',
    price: 1.29,
    isWeighted: false,
    barcode: '000000004046',
    pluCode: '4046',
    emoji: '🥑',
    brand: 'Verde Grove',
    badge: 'PLU 4046',
  },
  {
    id: 'prod-bellpepper',
    name: 'Green Bell Pepper',
    category: 'produce',
    price: 0.89,
    isWeighted: false,
    barcode: '000000004065',
    pluCode: '4065',
    emoji: '🫑',
    brand: 'Crisp Fields',
    badge: 'PLU 4065',
  },
  {
    id: 'prod-broccoli',
    name: 'Broccoli Crowns',
    category: 'produce',
    price: 1.89, // per lb
    isWeighted: true,
    weight: 1.2,
    barcode: '000000004060',
    pluCode: '4060',
    emoji: '🥦',
    brand: 'Fresh Farmstead',
    badge: 'PLU 4060',
  },
  {
    id: 'prod-lemon',
    name: 'Meyer Lemons (Each)',
    category: 'produce',
    price: 0.65,
    isWeighted: false,
    barcode: '000000004053',
    pluCode: '4053',
    emoji: '🍋',
    brand: 'Citrus Coast',
    badge: 'PLU 4053',
  },

  // --- Dairy & Eggs ---
  {
    id: 'dairy-milk',
    name: 'Whole Milk 1 Gallon',
    category: 'dairy',
    price: 3.89,
    isWeighted: false,
    barcode: '011110416001',
    emoji: '🥛',
    brand: 'Meadow Peak',
  },
  {
    id: 'dairy-yogurt',
    name: 'Greek Yogurt Vanilla 32oz',
    category: 'dairy',
    price: 4.49,
    isWeighted: false,
    barcode: '073420000122',
    emoji: '🥣',
    brand: 'Olympus Dairy',
  },
  {
    id: 'dairy-butter',
    name: 'Salted Pure Butter 16oz',
    category: 'dairy',
    price: 4.99,
    isWeighted: false,
    barcode: '076114002441',
    emoji: '🧈',
    brand: 'Golden Pasture',
  },
  {
    id: 'dairy-cheese',
    name: 'Sharp Cheddar Block 8oz',
    category: 'dairy',
    price: 3.79,
    isWeighted: false,
    barcode: '041303023150',
    emoji: '🧀',
    brand: 'Valley Artisans',
  },
  {
    id: 'dairy-eggs',
    name: 'Grade A Large Eggs 12ct',
    category: 'dairy',
    price: 3.49,
    isWeighted: false,
    barcode: '028400043816',
    emoji: '🥚',
    brand: 'Sunnyside Henhouse',
  },

  // --- Bakery ---
  {
    id: 'bake-sourdough',
    name: 'Artisan Sourdough Loaf',
    category: 'bakery',
    price: 4.5,
    isWeighted: false,
    barcode: '072220001025',
    emoji: '🍞',
    brand: 'Rustic Hearth',
  },
  {
    id: 'bake-croissants',
    name: 'Butter Croissants 4pk',
    category: 'bakery',
    price: 5.25,
    isWeighted: false,
    barcode: '041163489012',
    emoji: '🥐',
    brand: 'Bakery Atelier',
  },
  {
    id: 'bake-donuts',
    name: 'Glazed Donuts 6pk',
    category: 'bakery',
    price: 4.29,
    isWeighted: false,
    barcode: '038000198421',
    emoji: '🍩',
    brand: 'Sugar Wheel',
  },

  // --- Pantry & Snacks ---
  {
    id: 'pant-cereal',
    name: 'Honey Oat Crunch Cereal',
    category: 'pantry',
    price: 4.19,
    isWeighted: false,
    barcode: '043000014232',
    emoji: '🥣',
    brand: 'Golden Harvest',
  },
  {
    id: 'snack-chips',
    name: 'Kettle Sea Salt Chips',
    category: 'snack',
    price: 3.49,
    isWeighted: false,
    barcode: '084253240899',
    emoji: '🥔',
    brand: 'Crinkle Craft',
  },
  {
    id: 'snack-salsa',
    name: 'Roasted Salsa Mild 16oz',
    category: 'snack',
    price: 2.99,
    isWeighted: false,
    barcode: '021000658821',
    emoji: '🥫',
    brand: 'Sol Del Monte',
  },
  {
    id: 'snack-chocolate',
    name: 'Dark Chocolate 72% Bar',
    category: 'snack',
    price: 2.69,
    isWeighted: false,
    barcode: '034000002405',
    emoji: '🍫',
    brand: 'Velvet Bean',
  },

  // --- Beverages ---
  {
    id: 'bev-coldbrew',
    name: 'Cold Brew Nitro Coffee 32oz',
    category: 'beverage',
    price: 5.49,
    isWeighted: false,
    barcode: '085239044567',
    emoji: '☕',
    brand: 'Apex Roasters',
  },
  {
    id: 'bev-sparkling',
    name: 'Sparkling Mineral Water 6pk',
    category: 'beverage',
    price: 4.89,
    isWeighted: false,
    barcode: '070272212349',
    emoji: '🥤',
    brand: 'Pure Alps',
  },
  {
    id: 'bev-oj',
    name: 'Fresh Squeezed OJ 52oz',
    category: 'beverage',
    price: 3.99,
    isWeighted: false,
    barcode: '048500001028',
    emoji: '🍊',
    brand: 'Sunburst Orchards',
  },

  // --- Frozen ---
  {
    id: 'froz-pizza',
    name: 'Pepperoni Artisan Pizza',
    category: 'frozen',
    price: 6.99,
    isWeighted: false,
    barcode: '071117180224',
    emoji: '🍕',
    brand: 'Napoli Express',
  },
  {
    id: 'froz-pops',
    name: 'Wildberry Fruit Bars 6pk',
    category: 'frozen',
    price: 3.99,
    isWeighted: false,
    barcode: '077567000199',
    emoji: '🍧',
    brand: 'Glacier Chill',
  },
];

export const CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'cust-1',
    customerName: 'Clara Henderson',
    avatar: '👵',
    dialogue: 'Good morning, dear! I need to weigh these lovely organic bananas and get my breakfast groceries.',
    cardName: 'CLARA M HENDERSON',
    cardNumber: '4242 •••• •••• 8192',
    cardType: 'Visa',
    cardExpiry: '08/28',
    cardPin: '1428',
    paymentPreference: 'chip',
    items: [
      { item: GROCERY_CATALOG[0], quantity: 1, weight: 2.4 }, // Bananas PLU 4011
      { item: GROCERY_CATALOG[6], quantity: 1 }, // Milk
      { item: GROCERY_CATALOG[11], quantity: 1 }, // Sourdough
      { item: GROCERY_CATALOG[8], quantity: 1 }, // Butter
    ],
  },
  {
    id: 'cust-2',
    customerName: 'Marcus Torres',
    avatar: '💼',
    dialogue: 'Hey there! Fast scan please, meeting starts in 10 minutes. Also I have the coupon code SAVE10!',
    couponCode: 'SAVE10',
    cardName: 'MARCUS A TORRES',
    cardNumber: '5412 •••• •••• 9921',
    cardType: 'Mastercard',
    cardExpiry: '11/27',
    cardPin: '4092',
    paymentPreference: 'tap',
    items: [
      { item: GROCERY_CATALOG[18], quantity: 1 }, // Cold Brew
      { item: GROCERY_CATALOG[15], quantity: 1 }, // Kettle chips
      { item: GROCERY_CATALOG[17], quantity: 2 }, // Chocolate bar x 2
      { item: GROCERY_CATALOG[2], quantity: 2 }, // Avocados PLU 4046
    ],
  },
  {
    id: 'cust-3',
    customerName: 'Chef Matteo',
    avatar: '👨‍🍳',
    dialogue: 'Buon giorno! Weighing Honeycrisp apples for my apple tart today, plus fresh sourdough and sharp cheddar.',
    cardName: 'MATTEO ROSSI',
    cardNumber: '3782 •••• •••• 3041',
    cardType: 'Amex',
    cardExpiry: '03/29',
    cardPin: '9150',
    paymentPreference: 'chip',
    items: [
      { item: GROCERY_CATALOG[1], quantity: 1, weight: 1.8 }, // Honeycrisp Apples PLU 4173
      { item: GROCERY_CATALOG[9], quantity: 1 }, // Sharp Cheddar
      { item: GROCERY_CATALOG[12], quantity: 2 }, // Croissants x 2
      { item: GROCERY_CATALOG[5], quantity: 3 }, // Lemons PLU 4053 x 3
      { item: GROCERY_CATALOG[19], quantity: 1 }, // Sparkling water
    ],
  },
  {
    id: 'cust-4',
    customerName: 'Sarah & Tommy',
    avatar: '👩‍👧',
    dialogue: 'Movie night tonight! Tommy picked the pizza and donuts, and I brought my VIP5OFF coupon!',
    couponCode: 'VIP5OFF',
    cardName: 'SARAH L JENKINS',
    cardNumber: '4111 •••• •••• 4402',
    cardType: 'Visa',
    cardExpiry: '05/29',
    cardPin: '2714',
    paymentPreference: 'tap',
    items: [
      { item: GROCERY_CATALOG[21], quantity: 2 }, // Pizza x 2
      { item: GROCERY_CATALOG[13], quantity: 1 }, // Donuts
      { item: GROCERY_CATALOG[22], quantity: 1 }, // Popsicles
      { item: GROCERY_CATALOG[16], quantity: 1 }, // Salsa
      { item: GROCERY_CATALOG[15], quantity: 1 }, // Chips
    ],
  },
  {
    id: 'cust-5',
    customerName: 'Devon Vance',
    avatar: '🎧',
    dialogue: 'Just grabbing late night snacks and eggs for tomorrow. Will swipe my card!',
    cardName: 'DEVON VANCE',
    cardNumber: '5200 •••• •••• 7761',
    cardType: 'Mastercard',
    cardExpiry: '09/27',
    cardPin: '8833',
    paymentPreference: 'swipe',
    items: [
      { item: GROCERY_CATALOG[10], quantity: 1 }, // Eggs
      { item: GROCERY_CATALOG[14], quantity: 1 }, // Cereal
      { item: GROCERY_CATALOG[6], quantity: 1 }, // Milk
      { item: GROCERY_CATALOG[0], quantity: 1, weight: 1.5 }, // Bananas
    ],
  },
];
