import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Shop from './Shop';
import { productService } from '@/services/product';

vi.mock('@/services/product', () => ({
  productService: {
    getProducts: vi.fn(),
    getCategories: vi.fn(),
  },
}));

vi.mock('@/components/ProductCard', () => ({
  default: ({ product }: { product: { id: string; name: string } }) => <div data-testid="product-card">{product.name}</div>,
}));

const renderShop = (route = '/shop') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Shop />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('Shop page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productService.getCategories).mockResolvedValue(['Rings']);
    vi.mocked(productService.getProducts).mockResolvedValue([
      {
        id: 'p1',
        name: 'Test Product',
        price: 1000,
        image: '',
        category: 'Rings',
        weight: '1g',
        purity: '925',
        description: 'desc',
        inStock: true,
      },
    ] as never);
  });

  it('uses search query from URL', async () => {
    renderShop('/shop?search=coin');

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });

    const last = vi.mocked(productService.getProducts).mock.calls.at(-1)?.[0];
    expect(last).toEqual(expect.objectContaining({ search: 'coin' }));
  });

  it('applies selected price range as min/max price', async () => {
    renderShop('/shop');

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Under ₹500'));

    await waitFor(() => {
      const last = vi.mocked(productService.getProducts).mock.calls.at(-1)?.[0];
      expect(last).toEqual(expect.objectContaining({ minPrice: 0, maxPrice: 500 }));
    });

    fireEvent.click(screen.getByText('Above ₹5,000'));

    await waitFor(() => {
      const last = vi.mocked(productService.getProducts).mock.calls.at(-1)?.[0];
      expect(last).toEqual(expect.objectContaining({ minPrice: 5000, maxPrice: undefined }));
    });
  });

  it('clears filters when clear button is clicked', async () => {
    renderShop('/shop?search=ring');

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Under ₹500'));
    fireEvent.click(screen.getByText('Clear All Filters'));

    await waitFor(() => {
      const last = vi.mocked(productService.getProducts).mock.calls.at(-1)?.[0];
      expect(last).toEqual(expect.objectContaining({
        category: undefined,
        search: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      }));
    });
  });
});
