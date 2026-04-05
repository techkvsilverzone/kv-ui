import { useCallback } from 'react';

const STORAGE_KEY = 'kv-recently-viewed';
const MAX_ITEMS = 12;

export const useRecentlyViewed = () => {
  const getIds = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const addProduct = useCallback((productId: string) => {
    try {
      const current = getIds().filter((id) => id !== productId);
      const updated = [productId, ...current].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, [getIds]);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { getIds, addProduct, clearAll };
};
