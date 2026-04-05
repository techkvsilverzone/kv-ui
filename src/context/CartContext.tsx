import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { ApiCartItem } from '@/services/cart';
import { cartService } from '@/services/cart';
import { normalizeImageSrc } from '@/lib/image';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  weight: string;
  purity: string;
  description: string;
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
  isGiftVoucher?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartSyncing: boolean;
  isItemUpdating: (productId: string) => boolean;
  totalItems: number;
  totalPrice: number;
  taxAmount: number;
  totalWithTax: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kv-silver-cart';

const getStoredCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      ...item,
      image: normalizeImageSrc(item?.image || ''),
    }));
  } catch (error) {
    console.warn('Invalid cart data found in localStorage, resetting cart.', error);
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

const toItemMap = (items: CartItem[]) =>
  items.reduce<Record<string, CartItem>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

const mapServerCartItem = (item: ApiCartItem, fallbackMap: Record<string, CartItem>): CartItem | null => {
  const productRef = item.product || {};
  const id = String(productRef._id || productRef.id || '');

  if (!id) {
    return null;
  }

  const fallback = fallbackMap[id];

  return {
    id,
    name: productRef.name || fallback?.name || 'Product',
    price: Number(productRef.price ?? fallback?.price ?? 0),
    image: normalizeImageSrc(productRef.image || fallback?.image || ''),
    category: productRef.category || fallback?.category || '',
    weight: productRef.weight || fallback?.weight || '',
    purity: productRef.purity || fallback?.purity || '',
    description: productRef.description || fallback?.description || '',
    inStock: productRef.inStock ?? fallback?.inStock ?? true,
    isNew: fallback?.isNew,
    isSale: fallback?.isSale,
    originalPrice: fallback?.originalPrice,
    quantity: item.quantity,
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => getStoredCart());
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  const [pendingProductIds, setPendingProductIds] = useState<string[]>([]);

  const setItemPending = (productId: string, pending: boolean) => {
    setPendingProductIds((prevIds) => {
      if (pending) {
        return prevIds.includes(productId) ? prevIds : [...prevIds, productId];
      }

      return prevIds.filter((id) => id !== productId);
    });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.warn('Failed to persist cart in localStorage.', error);
      }
      return;
    }

    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear guest cart from localStorage.', error);
    }
  }, [items, isAuthenticated]);

  useEffect(() => {
    const syncCart = async () => {
      if (!isAuthenticated) {
        setItems(getStoredCart());
        setIsCartSyncing(false);
        return;
      }

      setIsCartSyncing(true);
      const guestItems = getStoredCart();
      const fallbackMap = toItemMap([...items, ...guestItems]);

      try {
        if (guestItems.length > 0) {
          await Promise.all(
            guestItems.map((item) => cartService.addOrUpdateItem(item.id, item.quantity)),
          );
        }

        const serverCart = await cartService.getCart();
        const mappedItems = (serverCart.items || [])
          .map((cartItem) => mapServerCartItem(cartItem, fallbackMap))
          .filter((cartItem): cartItem is CartItem => cartItem !== null);

        setItems(mappedItems);
      } catch (error) {
        console.error('Failed to sync cart', error);
      } finally {
        setIsCartSyncing(false);
      }
    };

    void syncCart();
  }, [isAuthenticated]);

  const addToCart = (product: Product) => {
    let nextQuantity = 1;

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        nextQuantity = existingItem.quantity + 1;
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      nextQuantity = 1;
      return [...prevItems, { ...product, quantity: 1 }];
    });

    if (isAuthenticated) {
      setItemPending(product.id, true);
      void cartService.addOrUpdateItem(product.id, nextQuantity).catch((error) => {
        console.error('Failed to add item to cart', error);
      }).finally(() => {
        setItemPending(product.id, false);
      });
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));

    if (isAuthenticated) {
      setItemPending(productId, true);
      void cartService.removeItem(productId).catch((error) => {
        console.error('Failed to remove item from cart', error);
      }).finally(() => {
        setItemPending(productId, false);
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );

    if (isAuthenticated) {
      setItemPending(productId, true);
      void cartService.addOrUpdateItem(productId, quantity).catch((error) => {
        console.error('Failed to update cart quantity', error);
      }).finally(() => {
        setItemPending(productId, false);
      });
    }
  };

  const clearCart = () => {
    const existingItems = [...items];
    setItems([]);

    if (isAuthenticated && existingItems.length > 0) {
      existingItems.forEach((item) => setItemPending(item.id, true));
      void Promise.all(
        existingItems.map((item) =>
          cartService
            .removeItem(item.id)
            .catch(() => undefined)
            .finally(() => setItemPending(item.id, false)),
        ),
      ).catch((error) => {
        console.error('Failed to clear cart', error);
      });
    }
  };

  const isItemUpdating = (productId: string) => pendingProductIds.includes(productId);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // 3% GST on non-gift-voucher items (gift vouchers have tax inclusive pricing)
  const taxableTotal = items.reduce(
    (sum, item) => (item.isGiftVoucher ? sum : sum + item.price * item.quantity),
    0,
  );
  const taxAmount = taxableTotal * 0.03;
  const totalWithTax = totalPrice + taxAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartSyncing,
        isItemUpdating,
        totalItems,
        totalPrice,
        taxAmount,
        totalWithTax,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
