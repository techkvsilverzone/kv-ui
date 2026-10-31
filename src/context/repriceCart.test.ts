import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/product', () => ({
  productService: {
    getProductById: vi.fn(async (id: string) => {
      if (id === 'gone') throw new Error('404');
      return {
        id, name: 'Bell', price: 1350, listedPrice: 1350, isFixedPrice: false, weight: '10', weightInGrams: 10,
        purity: '925', makingChargePercent: 10, inStock: true, stockAvailable: 4,
        pricing: { ratePerGram: 100, purityFraction: 0.925 },
      };
    }),
  },
}));

import { repriceCartItems, type CartItem } from './CartContext';

const line = (over: Partial<CartItem>): CartItem =>
  ({ id: 'p1', name: 'Bell', price: 650, image: '', category: '', weight: '10', purity: '925', description: '', inStock: true, quantity: 1, ...over }) as CartItem;

describe('repriceCartItems', () => {
  it('re-prices product lines at their chosen weight with the server formula', async () => {
    const [base, variant] = await repriceCartItems([line({}), line({ id: 'p2', weight: '20 g' })]);
    expect(base.price).toBe(1017.5); // 10 × 100 × 0.925 + 10%
    expect(variant.price).toBe(2035); // 20 g variant
    expect(base.stockAvailable).toBe(4);
  });

  it('leaves vouchers and unfetchable products alone', async () => {
    const items = [line({ id: 'v1', price: 1000, isGiftVoucher: true }), line({ id: 'gone', price: 650 })];
    const out = await repriceCartItems(items);
    expect(out.map((i) => i.price)).toEqual([1000, 650]);
  });
});
