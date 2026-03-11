import { api } from '@/lib/api';
import { normalizeImageSrc } from '@/lib/image';
import type { Product } from '@/context/CartContext';

interface WishlistProductRef {
  _id?: string;
  id?: string;
  imageId?: number;
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  weight?: string;
  purity?: string;
  description?: string;
  inStock?: boolean;
  isNew?: boolean;
  isNewItem?: boolean;
  isSale?: boolean;
}

interface ApiWishlistItem {
  product?: WishlistProductRef;
}

interface ApiWishlist {
  items?: ApiWishlistItem[];
  data?: ApiWishlistItem[];
}

const mapWishlistProduct = (item: ApiWishlistItem): Product | null => {
  const productRef = item.product || {};
  const id = String(productRef.id || productRef._id || productRef.imageId || '');

  if (!id) {
    return null;
  }

  return {
    id,
    name: productRef.name || 'Product',
    price: Number(productRef.price ?? 0),
    originalPrice: productRef.originalPrice,
    image: normalizeImageSrc(productRef.image || ''),
    category: productRef.category || '',
    weight: productRef.weight || '',
    purity: productRef.purity || '',
    description: productRef.description || '',
    inStock: productRef.inStock ?? true,
    isNew: productRef.isNewItem ?? productRef.isNew,
    isSale: productRef.isSale,
  };
};

const extractWishlistItems = (response: ApiWishlist | ApiWishlistItem[] | { data?: ApiWishlistItem[] }): ApiWishlistItem[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray((response as ApiWishlist).items)) {
    return (response as ApiWishlist).items || [];
  }

  if (Array.isArray((response as ApiWishlist).data)) {
    return (response as ApiWishlist).data || [];
  }

  if (Array.isArray((response as { data?: ApiWishlistItem[] }).data)) {
    return (response as { data?: ApiWishlistItem[] }).data || [];
  }

  return [];
};

export const wishlistService = {
  getWishlistProducts: async (): Promise<Product[]> => {
    const response = await api.get<ApiWishlist | ApiWishlistItem[] | { data?: ApiWishlistItem[] }>('/wishlist');
    const items = extractWishlistItems(response);

    return items
      .map((item) => mapWishlistProduct(item))
      .filter((product): product is Product => product !== null);
  },

  addItem: async (productId: string): Promise<void> => {
    await api.post('/wishlist/items', { productId });
  },

  removeItem: async (productId: string): Promise<void> => {
    await api.delete(`/wishlist/items/${productId}`);
  },
};
