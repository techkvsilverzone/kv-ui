import { api } from '../lib/api';
import type { Product } from '../context/CartContext';
import { normalizeImageSrc } from '@/lib/image';

interface ProductImage {
  variantName?: string;
  imageBase64?: string;
  sortOrder?: number;
}

interface ApiProduct extends Omit<Product, 'id' | 'isNew'> {
  _id?: string;
  id?: string;
  imageId?: number;
  imageBase64?: string;
  images?: ProductImage[];
  isNewItem?: boolean;
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
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}

const extractImage = (product: ApiProduct): string | undefined => {
  // Try the images array first (sorted by sortOrder)
  if (product.images?.length) {
    const sorted = [...product.images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const img = sorted.find(i => i.imageBase64);
    if (img?.imageBase64) return img.imageBase64;
  }
  // Fall back to flat imageBase64 or image field
  return product.imageBase64 || product.image;
};

const normalizeProduct = (product: ApiProduct): Product => ({
  ...product,
  id: product.id || product._id || String(product.imageId),
  image: normalizeImageSrc(extractImage(product)),
  isNew: product.isNewItem ?? product.isNew,
});

export const productService = {
  getProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const products = await api.get<ApiProduct[]>(`/products${queryString ? `?${queryString}` : ''}`);
    return products.map(normalizeProduct);
  },

  getProductById: async (id: string): Promise<Product> => {
    const product = await api.get<ApiProduct>(`/products/${id}`);
    return normalizeProduct(product);
  },

  getFeatured: async (): Promise<Product[]> => {
    const products = await api.get<ApiProduct[]>('/products/featured');
    return products.map(normalizeProduct);
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get<CategoriesResponse>('/products/categories');
    return response.data;
  },

  createCategory: async (name: string): Promise<void> => {
    return api.post<void>('/products/categories', { name });
  },

  deleteCategory: async (name: string): Promise<void> => {
    return api.delete<void>(`/products/categories/${encodeURIComponent(name)}`);
  },
};
