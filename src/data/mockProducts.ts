import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Beverages
  {
    id: 'p1',
    name: 'Espresso Macchiato',
    sku: 'BEV-ESP-01',
    price: 3.50,
    cost: 0.85,
    stock: 45,
    category: 'Beverages',
    categories: ['Beverages', 'Bakery & Dessert'],
    icon: '☕',
    color: 'amber',
    threshold: 10
  },
  {
    id: 'p2',
    name: 'Ice Latte Matcha',
    sku: 'BEV-MAT-02',
    price: 4.75,
    cost: 1.20,
    stock: 30,
    category: 'Beverages',
    categories: ['Beverages'],
    icon: '🍵',
    color: 'emerald',
    threshold: 8
  },
  {
    id: 'p3',
    name: 'Fresh Mango Smoothie',
    sku: 'BEV-SMO-03',
    price: 5.25,
    cost: 1.50,
    stock: 4, // low stock to trigger warnings out of the box!
    category: 'Beverages',
    categories: ['Beverages'],
    icon: '🥭',
    color: 'orange',
    threshold: 6
  },
  {
    id: 'p4',
    name: 'Sparkling Lemon Water',
    sku: 'BEV-SLW-04',
    price: 2.25,
    cost: 0.50,
    stock: 60,
    category: 'Beverages',
    categories: ['Beverages'],
    icon: '🥤',
    color: 'blue',
    threshold: 15
  },

  // Fast Food & Savory
  {
    id: 'p5',
    name: 'Classic Cheeseburger',
    sku: 'FOD-CHB-10',
    price: 8.99,
    cost: 3.20,
    stock: 25,
    category: 'Fast Food',
    categories: ['Fast Food'],
    icon: '🍔',
    color: 'rose',
    threshold: 10
  },
  {
    id: 'p6',
    name: 'Crispy French Fries (L)',
    sku: 'FOD-FRI-11',
    price: 3.99,
    cost: 0.90,
    stock: 40,
    category: 'Fast Food',
    categories: ['Fast Food'],
    icon: '🍟',
    color: 'yellow',
    threshold: 12
  },
  {
    id: 'p7',
    name: 'Fluffy Buffalo Wings (8pcs)',
    sku: 'FOD-WIN-12',
    price: 10.50,
    cost: 4.10,
    stock: 5, // low stock trigger
    category: 'Fast Food',
    categories: ['Fast Food'],
    icon: '🍗',
    color: 'red',
    threshold: 8
  },

  // Bakery & Dessert
  {
    id: 'p8',
    name: 'Butter Croissant',
    sku: 'BAK-CRO-20',
    price: 3.20,
    cost: 0.70,
    stock: 18,
    category: 'Bakery & Dessert',
    categories: ['Bakery & Dessert'],
    icon: '🥐',
    color: 'amber',
    threshold: 5
  },
  {
    id: 'p9',
    name: 'Choco Lava Doughnut',
    sku: 'BAK-DON-21',
    price: 2.80,
    cost: 0.60,
    stock: 15,
    category: 'Bakery & Dessert',
    categories: ['Bakery & Dessert', 'Fast Food'],
    icon: '🍩',
    color: 'pink',
    threshold: 6
  },
  {
    id: 'p10',
    name: 'Red Velvet Slice Cake',
    sku: 'BAK-CAK-22',
    price: 4.50,
    cost: 1.10,
    stock: 8,
    category: 'Bakery & Dessert',
    categories: ['Bakery & Dessert'],
    icon: '🍰',
    color: 'violet',
    threshold: 4
  },

  // Electronics & Office
  {
    id: 'p11',
    name: 'Wireless Ergonomic Mouse',
    sku: 'ELC-MOU-30',
    price: 29.99,
    cost: 12.00,
    stock: 12,
    category: 'Electronics',
    categories: ['Electronics'],
    icon: '🖱️',
    color: 'teal',
    threshold: 3
  },
  {
    id: 'p12',
    name: 'RGB Mechanical Keyboard',
    sku: 'ELC-KEY-31',
    price: 69.99,
    cost: 30.00,
    stock: 7,
    category: 'Electronics',
    categories: ['Electronics'],
    icon: '⌨️',
    color: 'indigo',
    threshold: 3
  },

  // Apparel & Merch
  {
    id: 'p13',
    name: 'Notus Premium Cotton Hoodie',
    sku: 'APR-HOD-40',
    price: 45.00,
    cost: 18.00,
    stock: 14,
    category: 'Apparel',
    categories: ['Apparel'],
    icon: '🧥',
    color: 'sky',
    threshold: 5
  },
  {
    id: 'p14',
    name: 'Classic Canvas Cap',
    sku: 'APR-CAP-41',
    price: 18.50,
    cost: 6.00,
    stock: 2, // low stock trigger
    category: 'Apparel',
    categories: ['Apparel'],
    icon: '🧢',
    color: 'purple',
    threshold: 4
  }
];

export const CATEGORIES = [
  'All',
  'Beverages',
  'Fast Food',
  'Bakery & Dessert',
  'Electronics',
  'Apparel'
];

export const DISCOUNT_CODES: { code: string; type: 'percent' | 'flat'; value: number }[] = [
  { code: 'NOTUS10', type: 'percent', value: 10 },
  { code: 'SAVEMORE20', type: 'percent', value: 20 },
  { code: 'WELCOME5', type: 'flat', value: 5 },
  { code: 'VIPFREE15', type: 'percent', value: 15 }
];
