import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productService } from './product';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/image', () => ({
  normalizeImageSrc: vi.fn((src?: string) => (src ? `normalized:${src}` : undefined)),
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds products query string from filters', async () => {
    vi.mocked(api.get).mockResolvedValue([]);

    await productService.getProducts({
      category: 'Rings',
      minPrice: 500,
      maxPrice: 2000,
      search: 'coin',
      sortBy: 'price_asc',
    });

    const path = vi.mocked(api.get).mock.calls[0][0] as string;
    expect(path).toContain('/products?');
    expect(path).toContain('category=Rings');
    expect(path).toContain('minPrice=500');
    expect(path).toContain('maxPrice=2000');
    expect(path).toContain('search=coin');
    expect(path).toContain('sortBy=price_asc');
  });

  it('normalizes product id and image', async () => {
    vi.mocked(api.get).mockResolvedValue([
      {
        _id: 'mongo-1',
        name: 'Item',
        price: 100,
        image: 'raw-image',
        category: 'Rings',
        weight: '1g',
        purity: '925',
        description: 'desc',
        inStock: true,
      },
    ]);

    const list = await productService.getProducts();

    expect(list[0].id).toBe('mongo-1');
    expect(list[0].image).toBe('normalized:raw-image');
  });

  it('reads categories from data wrapper', async () => {
    vi.mocked(api.get).mockResolvedValue({ status: 'success', data: ['Rings', 'Coins'] });

    const categories = await productService.getCategories();

    expect(api.get).toHaveBeenCalledWith('/products/categories');
    expect(categories).toEqual(['Rings', 'Coins']);
  });
});
