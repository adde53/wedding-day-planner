// Stripe product and price IDs for premium features
// Updated: 2026-02-03

export type FeatureId = 
  | 'premium_package'
  | 'drink_calculator'
  | 'food_calculator'
  | 'table_planner'
  | 'excel_export'
  | 'wedding_website';

export interface FeatureConfig {
  id: FeatureId;
  name: string;
  description: string;
  priceId: string;
  productId: string;
  price: number; // in SEK
}

// Premium package - all features
export const PREMIUM_PACKAGE: FeatureConfig = {
  id: 'premium_package',
  name: 'Premium Paket',
  description: 'Alla premium-funktioner',
  priceId: 'price_1SwnvoPI0lb9OQXcjMwzTJmF',
  productId: 'prod_TudCRh0hxEuFg2',
  price: 199,
};

// Individual features
export const INDIVIDUAL_FEATURES: FeatureConfig[] = [
  {
    id: 'drink_calculator',
    name: 'Dryckeskalkylator',
    description: 'Beräkna dryckesmängd och kostnader',
    priceId: 'price_1SwoGVPI0lb9OQXcyT3QLTgY',
    productId: 'prod_TudX2skted9fth',
    price: 79,
  },
  {
    id: 'food_calculator',
    name: 'Matkalkylator',
    description: 'Beräkna matmängd och cateringkostnader',
    priceId: 'price_1SwoHNPI0lb9OQXctKWVUFVD',
    productId: 'prod_TudYBI9qnd1Rgj',
    price: 79,
  },
  {
    id: 'table_planner',
    name: 'Bordsplacering',
    description: 'Visuell bordsplacering för alla gäster',
    priceId: 'price_1SwoHcPI0lb9OQXcrhe51w5C',
    productId: 'prod_TudYgmi3aUWvXH',
    price: 79,
  },
  {
    id: 'excel_export',
    name: 'Excel-export',
    description: 'Exportera gästlista till Excel',
    priceId: 'price_1SwoHyPI0lb9OQXcJdMn7KwN',
    productId: 'prod_TudZ0e4I5yPH4V',
    price: 79,
  },
  {
    id: 'wedding_website',
    name: 'Bröllopshemsida',
    description: 'Skapa en egen hemsida för gästerna',
    priceId: 'price_1SwoJZPI0lb9OQXcLrJ8px9D',
    productId: 'prod_TudaHx71rtD8q2',
    price: 79,
  },
];

// All features including package
export const ALL_FEATURES: FeatureConfig[] = [PREMIUM_PACKAGE, ...INDIVIDUAL_FEATURES];

// Get feature by ID
export function getFeatureById(id: FeatureId): FeatureConfig | undefined {
  return ALL_FEATURES.find(f => f.id === id);
}

// Get feature by price ID
export function getFeatureByPriceId(priceId: string): FeatureConfig | undefined {
  return ALL_FEATURES.find(f => f.priceId === priceId);
}

// Get feature by product ID
export function getFeatureByProductId(productId: string): FeatureConfig | undefined {
  return ALL_FEATURES.find(f => f.productId === productId);
}

// Calculate total if buying all individually
export const INDIVIDUAL_TOTAL = INDIVIDUAL_FEATURES.reduce((sum, f) => sum + f.price, 0);

// Savings when buying package vs individual
export const PACKAGE_SAVINGS = INDIVIDUAL_TOTAL - PREMIUM_PACKAGE.price;
