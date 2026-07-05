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

  it('normalizes and trims variants, dropping empty rows', async () => {
    vi.mocked(api.get).mockResolvedValue([
      {
        _id: 'mongo-2',
        name: 'Anklet',
        price: 200,
        variants: [
          { label: ' S ', weight: ' 20g ', height: ' 2cm ', breadth: '' },
          { label: '', weight: '' }, // empty -> dropped
          { label: 'L', weight: '40g' },
        ],
      },
    ]);

    const list = await productService.getProducts();

    expect(list[0].variants).toEqual([
      { label: 'S', weight: '20g', height: '2cm', breadth: undefined },
      { label: 'L', weight: '40g', height: undefined, breadth: undefined },
    ]);
  });

  it('leaves variants undefined when none are provided', async () => {
    vi.mocked(api.get).mockResolvedValue([{ _id: 'mongo-3', name: 'Ring', price: 50 }]);

    const list = await productService.getProducts();

    expect(list[0].variants).toBeUndefined();
  });

  it('normalizes pricing config (fixed price, making charge, wastage)', async () => {
    vi.mocked(api.get).mockResolvedValue([
      {
        _id: 'mongo-4',
        name: 'Coin',
        price: 1000,
        isFixedPrice: true,
        makingCharge: { type: 'percentage', value: '12' },
        wastage: { type: 'amount', value: 250 },
      },
    ]);

    const list = await productService.getProducts();

    expect(list[0].isFixedPrice).toBe(true);
    expect(list[0].makingCharge).toEqual({ type: 'percentage', value: 12 });
    expect(list[0].wastage).toEqual({ type: 'amount', value: 250 });
  });

  it('drops charges with non-numeric values and defaults unknown type to percentage', async () => {
    vi.mocked(api.get).mockResolvedValue([
      {
        _id: 'mongo-5',
        name: 'Bangle',
        price: 500,
        makingCharge: { type: 'weird', value: 8 },
        wastage: { type: 'amount', value: 'abc' },
      },
    ]);

    const list = await productService.getProducts();

    expect(list[0].makingCharge).toEqual({ type: 'percentage', value: 8 });
    expect(list[0].wastage).toBeUndefined();
    expect(list[0].isFixedPrice).toBeUndefined();
  });

  it('normalizes all images (sorted) into an array with image as the primary', async () => {
    vi.mocked(api.get).mockResolvedValue([
      {
        _id: 'mongo-6',
        name: 'Ring',
        price: 300,
        images: [
          { imageBase64: 'second', sortOrder: 2 },
          { imageBase64: 'first', sortOrder: 1 },
        ],
      },
    ]);

    const list = await productService.getProducts();

    expect(list[0].images).toEqual(['normalized:first', 'normalized:second']);
    expect(list[0].image).toBe('normalized:first');
  });

  it('falls back to the flat image field for the images array', async () => {
    vi.mocked(api.get).mockResolvedValue([
      { _id: 'mongo-7', name: 'Coin', price: 50, image: 'solo' },
    ]);

    const list = await productService.getProducts();

    expect(list[0].images).toEqual(['normalized:solo']);
  });

  it('reads categories from data wrapper', async () => {
    vi.mocked(api.get).mockResolvedValue({ status: 'success', data: ['Rings', 'Coins'] });

    const categories = await productService.getCategories();

    expect(api.get).toHaveBeenCalledWith('/products/categories');
    expect(categories).toEqual(['Rings', 'Coins']);
  });
});
