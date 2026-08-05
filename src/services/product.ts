import { api } from '../lib/api';
import type { Product, ProductVariant, ProductCharge } from '../context/CartContext';
import { normalizeImageSrc } from '../lib/image';

interface ProductImage {
  variantName?: string;
  imageBase64?: string;
  sortOrder?: number;
}

interface ApiProduct extends Partial<Omit<Product, 'id' | 'images'>> {
  _id?: string;
  id?: string;
  imageId?: number;
  imageBase64?: string;
  images?: ProductImage[];
  isNewItem?: boolean;
  material?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  isActive?: boolean;
  stockAvailable?: number;
  weightInGrams?: number;
  variants?: ProductVariant[];
  isFixedPrice?: boolean;
  makingCharge?: ProductCharge;
  wastage?: ProductCharge;
  pricing?: {
    metalValue?: number;
    makingCharge?: number;
    ratePerGram?: number;
    basis?: string;
  };
}

/**
 * Normalizes the raw variants array from the API into clean ProductVariant objects,
 * dropping any entry without a label or weight. Returns undefined when there are none.
 */
const normalizeVariants = (variants?: ProductVariant[]): ProductVariant[] | undefined => {
  if (!Array.isArray(variants)) return undefined;
  const cleaned = variants
    .filter((v) => v && (v.label || v.weight))
    .map((v) => ({
      label: String(v.label ?? '').trim(),
      weight: String(v.weight ?? '').trim(),
      height: v.height ? String(v.height).trim() : undefined,
      breadth: v.breadth ? String(v.breadth).trim() : undefined,
    }));
  return cleaned.length ? cleaned : undefined;
};

/**
 * Normalizes a raw charge (making charge / wastage) into a clean ProductCharge.
 * Returns undefined when the value is missing or not a finite number.
 */
const normalizeCharge = (charge?: ProductCharge): ProductCharge | undefined => {
  if (!charge || charge.value === undefined || charge.value === null) return undefined;
  const value = Number(charge.value);
  if (!Number.isFinite(value)) return undefined;
  return { type: charge.type === 'amount' ? 'amount' : 'percentage', value };
};

/** A top-level category and its subcategories (only Jewellery has any today). */
export interface CategoryNode {
  name: string;
  subcategories: string[];
}

interface CategoriesResponse {
  status: string;
  data: CategoryNode[];
}

interface TagsResponse {
  status: string;
  data: string[];
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  tags?: string;
  metal?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  onSale?: boolean | string;
  featured?: boolean | string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  /** 1-indexed page for paginated/infinite-scroll fetches. */
  page?: number;
  /** Page size for paginated/infinite-scroll fetches. */
  limit?: number;
}

/**
 * Extracts the primary image from an API product response.
 * Prioritizes the images array (sorted) before falling back to flat image fields.
 */
const extractImage = (product: ApiProduct): string | undefined => {
  if (product.images?.length) {
    const sorted = [...product.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const img = sorted.find(i => i.imageBase64);
    if (img?.imageBase64) return img.imageBase64;
  }
  return product.imageBase64 || product.image;
};

/**
 * Extracts all product images (sorted) as normalized srcs, falling back to the flat image fields.
 * Returns undefined when there are none, so the UI can fall back to the single `image`.
 */
const extractImages = (product: ApiProduct): string[] | undefined => {
  const srcs: string[] = [];
  if (product.images?.length) {
    [...product.images]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .forEach(i => {
        if (i.imageBase64) srcs.push(i.imageBase64);
      });
  }
  if (!srcs.length) {
    const flat = product.imageBase64 || product.image;
    if (flat) srcs.push(flat);
  }
  const normalized = srcs.map(s => normalizeImageSrc(s)).filter(Boolean);
  return normalized.length ? normalized : undefined;
};

/**
 * Normalizes an API product response into a frontend Product object.
 * Handles field aliasing (material -> category, isActive -> inStock) and string conversions.
 */
const normalizeProduct = (product: ApiProduct): Product => ({
  id: product.id || product._id || String(product.imageId || ''),
  name: product.name || 'Unnamed Product',
  price: typeof product.price === 'number' ? product.price : 0,
  originalPrice: product.originalPrice,
  image: normalizeImageSrc(extractImage(product)),
  images: extractImages(product),
  category: product.category || '',
  subcategory: product.subcategory || undefined,
  tags: Array.isArray(product.tags) && product.tags.length ? product.tags : undefined,
  material: product.material || undefined,
  weight: product.weight !== undefined && product.weight !== null ? String(product.weight) : '',
  purity: product.purity ? String(product.purity) : '',
  description: product.description || '',
  inStock:
    product.stockAvailable !== undefined && product.stockAvailable !== null
      ? product.stockAvailable > 0
      : product.inStock ?? product.isActive ?? true,
  stockAvailable: product.stockAvailable,
  weightInGrams: product.weightInGrams,
  variants: normalizeVariants(product.variants),
  isFixedPrice: product.isFixedPrice ?? undefined,
  makingCharge: normalizeCharge(product.makingCharge),
  wastage: normalizeCharge(product.wastage),
  pricing: product.pricing,
  isNew: product.isNewItem ?? product.isNew,
  isSale: product.isSale,
  isGiftVoucher: product.isGiftVoucher,
});

export const productService = {
  /**
   * Fetches a list of products based on optional filters.
   */
  getProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const products = await api.get<ApiProduct[]>(`/products${queryString ? `?${queryString}` : ''}`);
    return Array.isArray(products) ? products.map(normalizeProduct) : [];
  },

  /**
   * Fetches a single product by its unique ID.
   */
  getProductById: async (id: string): Promise<Product> => {
    const product = await api.get<ApiProduct>(`/products/${id}`);
    return normalizeProduct(product);
  },

  /**
   * Fetches the latest featured products.
   */
  getFeatured: async (): Promise<Product[]> => {
    const products = await api.get<ApiProduct[]>('/products/featured');
    return Array.isArray(products) ? products.map(normalizeProduct) : [];
  },

  /**
   * Fetches the category/subcategory tree.
   */
  getCategories: async (): Promise<CategoryNode[]> => {
    const response = await api.get<CategoriesResponse>('/products/categories');
    return Array.isArray(response?.data) ? response.data : [];
  },

  /**
   * Fetches the list of tags in use across active products.
   */
  getTags: async (): Promise<string[]> => {
    const response = await api.get<TagsResponse>('/products/tags');
    return Array.isArray(response?.data) ? response.data : [];
  },

  /**
   * Administrative: Creates a new category, or a subcategory when `parent` is given.
   */
  createCategory: async (name: string, parent?: string): Promise<void> => {
    return api.post<void>('/products/categories', parent ? { name, parent } : { name });
  },

  /**
   * Administrative: Deletes a category (or subcategory, when `parent` is given) by name.
   */
  deleteCategory: async (name: string, parent?: string): Promise<void> => {
    const query = parent ? `?parent=${encodeURIComponent(parent)}` : '';
    return api.delete<void>(`/products/categories/${encodeURIComponent(name)}${query}`);
  },
};
