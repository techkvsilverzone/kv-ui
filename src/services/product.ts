import { api } from '../lib/api';
import type { Product } from '../context/CartContext';
import { normalizeImageSrc } from '../lib/image';

interface ProductImage {
  variantName?: string;
  imageBase64?: string;
  sortOrder?: number;
}

interface ApiProduct extends Partial<Omit<Product, 'id'>> {
  _id?: string;
  id?: string;
  imageId?: number;
  imageBase64?: string;
  images?: ProductImage[];
  isNewItem?: boolean;
  material?: string;
  isActive?: boolean;
}

interface CategoriesResponse {
  status: string;
  data: string[];
}

export interface ProductFilters {
  category?: string;
  metal?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  onSale?: boolean | string;
  featured?: boolean | string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
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
 * Normalizes an API product response into a frontend Product object.
 * Handles field aliasing (material -> category, isActive -> inStock) and string conversions.
 */
const normalizeProduct = (product: ApiProduct): Product => ({
  id: product.id || product._id || String(product.imageId || ''),
  name: product.name || 'Unnamed Product',
  price: typeof product.price === 'number' ? product.price : 0,
  originalPrice: product.originalPrice,
  image: normalizeImageSrc(extractImage(product)),
  category: product.category || product.material || '',
  weight: product.weight !== undefined && product.weight !== null ? String(product.weight) : '',
  purity: product.purity ? String(product.purity) : '',
  description: product.description || '',
  inStock: product.inStock ?? product.isActive ?? true,
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
   * Fetches the list of unique material/category names from the database.
   */
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<CategoriesResponse>('/products/categories');
    return Array.isArray(response?.data) ? response.data : [];
  },

  /**
   * Administrative: Creates a new category.
   */
  createCategory: async (name: string): Promise<void> => {
    return api.post<void>('/products/categories', { name });
  },

  /**
   * Administrative: Deletes a category by name.
   */
  deleteCategory: async (name: string): Promise<void> => {
    return api.delete<void>(`/products/categories/${encodeURIComponent(name)}`);
  },
};
