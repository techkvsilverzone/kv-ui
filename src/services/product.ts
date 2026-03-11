import { api } from '../lib/api';
import type { Product } from '../context/CartContext';
import { normalizeImageSrc } from '@/lib/image';

interface ApiProduct extends Omit<Product, 'id' | 'isNew'> {
  _id?: string;
  id?: string;
  imageId?: number;
  isNewItem?: boolean;
}

interface CategoriesResponse {
  status: string;
  data: string[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}

const normalizeProduct = (product: ApiProduct): Product => ({
  ...product,
  id: product.id || product._id || String(product.imageId),
  image: normalizeImageSrc(product.image),
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
};
