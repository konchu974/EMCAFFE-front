// lib/types/product.types.ts

// ==================== ENUMS ====================

export enum CoffeeType {
  ARABICA = 'ARABICA',
  ROBUSTA = 'ROBUSTA',
  BLEND = 'BLEND',
  DECAFFEINATED = 'DECAFFEINATED',
  ORGANIC = 'ORGANIC',
}

export enum RoastLevel {
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  DARK = 'DARK',
  EXTRA_DARK = 'EXTRA_DARK',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

// ==================== BASE INTERFACES ====================

export interface Product {
  id_product: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  intensity?: number; // 1-10
  format?: string; // ex: 250g, 500g, 1kg, 10 capsules
  coffee_type?: CoffeeType;
  origin?: string; // ex: Colombie, Brésil, Éthiopie
  roast_level?: RoastLevel;
  image_url?: string;
  category: string;
  is_active: number; // 0 ou 1
  size?: string;
  preparation?: string;
  ingredient?: string;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  idVariant: string;
  productId: string;
  format: string; // ex: 250g, 500g, 1kg
  price: number;
  stock: number;
  sku: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DTO INTERFACES ====================

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  intensity?: number;
  format?: string;
  coffee_type?: CoffeeType;
  origin?: string;
  roast_level?: RoastLevel;
  image_url?: string;
  category?: string;
  is_active?: number;
  size?: string;
  preparation?: string;
  ingredient?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  intensity?: number;
  format?: string;
  coffee_type?: CoffeeType;
  origin?: string;
  roast_level?: RoastLevel;
  image_url?: string;
  category?: string;
  is_active?: number;
  size?: string;
  preparation?: string;
  ingredient?: string;
}

export interface UpdateStockDto {
  stock: number;
}

export interface CreateProductVariantDto {
  productId: string;
  format: string;
  price: number;
  stock?: number;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateProductVariantDto {
  format?: string;
  price?: number;
  stock?: number;
  sku?: string;
  isActive?: boolean;
}

// ==================== FILTER INTERFACES ====================

export interface ProductFilters {
  coffee_type?: CoffeeType | CoffeeType[];
  roast_level?: RoastLevel | RoastLevel[];
  intensity?: number;
  minIntensity?: number;
  maxIntensity?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  is_active?: number;
  category?: string;
  origin?: string;
  format?: string;
  search?: string;
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'created_at' | 'stock' | 'intensity';
  order: 'asc' | 'desc';
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  filters?: ProductFilters;
  sort?: ProductSortOptions;
}

// ==================== RESPONSE INTERFACES ====================

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
    data: Product[];
}

export interface ProductResponse {
  success: boolean;
  data: ProductWithVariants;
  message?: string;
}

export interface ProductDetailResponse {
  product: Product;
  message?: string;
}
export interface ProductVariantResponse {
  variant: ProductVariant;
  message?: string;
}

// ==================== CART & ORDER INTERFACES ====================

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  subtotal: number;
}

export interface ProductInventory {
  productId: string;
  productName: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  variants?: {
    variantId: string;
    format: string;
    stock: number;
    reserved: number;
    available: number;
  }[];
}

// ==================== ANALYTICS INTERFACES ====================

export interface ProductAnalytics {
  productId: string;
  productName: string;
  views: number;
  sales: number;
  revenue: number;
  averageRating?: number;
  reviewCount?: number;
}

export interface LowStockProduct {
  id_product: string;
  name: string;
  stock: number;
  threshold: number;
  status: 'low' | 'critical' | 'out';
  variants?: {
    idVariant: string;
    format: string;
    stock: number;
  }[];
}

// ==================== HELPER TYPES ====================

export type ProductWithOptionalVariants = Product & {
  variants?: ProductVariant[];
};

export type ProductFormData = Omit<Product, 'id_product' | 'created_at' | 'updated_at'>;

export type PartialProduct = Partial<Product>;

// ==================== TYPE GUARDS ====================

export function isProductWithVariants(
  product: Product | ProductWithVariants
): product is ProductWithVariants {
  return 'variants' in product && Array.isArray(product.variants);
}

export function isValidCoffeeType(value: string): value is CoffeeType {
  return Object.values(CoffeeType).includes(value as CoffeeType);
}

export function isValidRoastLevel(value: string): value is RoastLevel {
  return Object.values(RoastLevel).includes(value as RoastLevel);
}

export function isProductActive(product: Product): boolean {
  return product.is_active === 1;
}

export function hasVariants(product: Product): boolean {
  return product.variants !== undefined && product.variants.length > 0;
}

// ==================== CONSTANTS ====================

export const COFFEE_TYPE_LABELS: Record<CoffeeType, string> = {
  [CoffeeType.ARABICA]: 'Arabica',
  [CoffeeType.ROBUSTA]: 'Robusta',
  [CoffeeType.BLEND]: 'Mélange',
  [CoffeeType.DECAFFEINATED]: 'Décaféiné',
  [CoffeeType.ORGANIC]: 'Biologique',
};

export const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = {
  [RoastLevel.LIGHT]: 'Torréfaction légère',
  [RoastLevel.MEDIUM]: 'Torréfaction moyenne',
  [RoastLevel.DARK]: 'Torréfaction foncée',
  [RoastLevel.EXTRA_DARK]: 'Torréfaction très foncée',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'Actif',
  [ProductStatus.INACTIVE]: 'Inactif',
  [ProductStatus.OUT_OF_STOCK]: 'Rupture de stock',
};

export const INTENSITY_LABELS: Record<number, string> = {
  1: 'Très doux',
  2: 'Doux',
  3: 'Doux+',
  4: 'Équilibré léger',
  5: 'Équilibré',
  6: 'Équilibré+',
  7: 'Corsé',
  8: 'Corsé+',
  9: 'Très corsé',
  10: 'Intense',
};

export const LOW_STOCK_THRESHOLD = 10;
export const CRITICAL_STOCK_THRESHOLD = 5;

export const COMMON_FORMATS = [
  '250g',
  '500g',
  '1kg',
  '10 capsules',
  '20 capsules',
  '50 capsules',
  '100 capsules',
];

export const COFFEE_ORIGINS = [
  'Brésil',
  'Colombie',
  'Éthiopie',
  'Kenya',
  'Guatemala',
  'Costa Rica',
  'Pérou',
  'Vietnam',
  'Indonésie',
  'Honduras',
];

// ==================== UTILITY FUNCTIONS ====================

/**
 * Obtenir le label d'intensité
 */
export function getIntensityLabel(intensity?: number): string {
  if (!intensity || intensity < 1 || intensity > 10) {
    return 'Non spécifié';
  }
  return INTENSITY_LABELS[intensity] || `Intensité ${intensity}`;
}

/**
 * Calculer le stock total (produit + variantes)
 */
export function getTotalStock(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return product.stock;
  }
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

/**
 * Vérifier si le produit est en rupture de stock
 */
export function isOutOfStock(product: Product): boolean {
  return getTotalStock(product) === 0;
}

/**
 * Vérifier si le produit a un stock faible
 */
export function isLowStock(product: Product, threshold: number = LOW_STOCK_THRESHOLD): boolean {
  const totalStock = getTotalStock(product);
  return totalStock > 0 && totalStock <= threshold;
}

/**
 * Obtenir le prix le plus bas d'un produit (en tenant compte des variantes)
 */
export function getLowestPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return product.price;
  }
  const variantPrices = product.variants.map(v => v.price);
  return Math.min(product.price, ...variantPrices);
}

/**
 * Obtenir le prix le plus haut d'un produit (en tenant compte des variantes)
 */
export function getHighestPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return product.price;
  }
  const variantPrices = product.variants.map(v => v.price);
  return Math.max(product.price, ...variantPrices);
}

/**
 * Formater le prix pour l'affichage
 */
export function formatPrice(price: number, currency: string = '€'): string {
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Obtenir la plage de prix pour un produit avec variantes
 */
export function getPriceRange(product: Product, currency: string = '€'): string {
  const lowest = getLowestPrice(product);
  const highest = getHighestPrice(product);
  
  if (lowest === highest) {
    return formatPrice(lowest, currency);
  }
  
  return `${formatPrice(lowest, currency)} - ${formatPrice(highest, currency)}`;
}