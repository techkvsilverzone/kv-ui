import { api } from '../lib/api';

interface CartProductRef {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  weight?: string;
  purity?: string;
  description?: string;
  inStock?: boolean;
}

export interface ApiCartItem {
  product: CartProductRef;
  quantity: number;
}

export interface ApiCart {
  _id?: string;
  user?: string;
  items: ApiCartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export const cartService = {
  getCart: async (): Promise<ApiCart> => {
    return api.get<ApiCart>('/cart');
  },

  addOrUpdateItem: async (productId: string, quantity: number): Promise<ApiCart> => {
    return api.post<ApiCart>('/cart/items', { productId, quantity });
  },

  removeItem: async (productId: string): Promise<ApiCart> => {
    return api.delete<ApiCart>(`/cart/items/${productId}`);
  },
};
