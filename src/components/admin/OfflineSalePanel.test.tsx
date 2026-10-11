import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Product } from '@/context/CartContext';
import OfflineSalePanel from './OfflineSalePanel';

const quoteOfflineSale = vi.hoisted(() => vi.fn());
const createOfflineSale = vi.hoisted(() => vi.fn());
vi.mock('@/services/admin', () => ({ adminService: { quoteOfflineSale, createOfflineSale } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/components/admin/PrintInvoiceButton', () => ({ default: () => <button>Print invoice</button> }));

const product = (overrides: Partial<Product>): Product => ({
  id: '5', name: 'Silver Ring', price: 1000, image: '', category: 'Jewellery', weight: '4', purity: '925',
  description: '', inStock: true, stockAvailable: 3, ...overrides,
});

const products = [
  product({}),
  product({ id: '6', name: 'Silver Coin', stockAvailable: 0, inStock: false }),
  product({ id: '7', name: 'Gift Voucher', isGiftVoucher: true }),
];

const renderPanel = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <OfflineSalePanel products={products} />
    </QueryClientProvider>,
  );

describe('OfflineSalePanel', () => {
  beforeEach(() => {
    quoteOfflineSale.mockReset().mockResolvedValue({
      items: [{ product: '5', name: 'Silver Ring', quantity: 2, weight: 4, unitPrice: 1000, totalPrice: 2000 }],
      subtotal: 2000, discount: 0, couponCode: null, gstPercent: 3, taxAmount: 60, grandTotal: 2060,
    });
    createOfflineSale.mockReset().mockResolvedValue({
      id: '77', invoiceNumber: 'INV-2026-000042', totalAmount: 2060, paymentMethod: 'upi', items: [],
    });
  });

  it('hides gift vouchers and blocks out-of-stock products', () => {
    renderPanel();

    expect(screen.queryByText('Gift Voucher')).not.toBeInTheDocument();
    const coin = screen.getByText('Silver Coin').closest('li')!;
    expect(within(coin).getByText('Out of stock')).toBeInTheDocument();
    expect(within(coin).getByRole('button', { name: /Add/ })).toBeDisabled();
  });

  it('bills a walk-in: server-priced totals, payment mode, then the invoice number', async () => {
    renderPanel();

    const ring = screen.getByText('Silver Ring').closest('li')!;
    fireEvent.click(within(ring).getByRole('button', { name: /Add/ }));
    fireEvent.click(within(ring).getByRole('button', { name: /Add/ }));

    expect(await screen.findByText('₹2,060.00')).toBeInTheDocument();
    expect(quoteOfflineSale).toHaveBeenLastCalledWith({ items: [{ product: '5', quantity: 2 }] });

    fireEvent.change(screen.getByLabelText('Customer mobile'), { target: { value: '+91 81908 58375' } });
    fireEvent.change(screen.getByLabelText('Sale location'), { target: { value: 'Anna Nagar stall' } });
    fireEvent.click(screen.getByRole('radio', { name: 'UPI' }));
    fireEvent.click(screen.getByRole('button', { name: /Complete sale/ }));

    expect(await screen.findByText('INV-2026-000042')).toBeInTheDocument();
    expect(createOfflineSale).toHaveBeenCalledWith({
      items: [{ product: '5', quantity: 2 }],
      paymentMethod: 'upi',
      saleLocation: 'Anna Nagar stall',
      customer: { name: '', phone: '8190858375', address: '' },
    });
    expect(screen.getByRole('button', { name: 'New sale' })).toBeInTheDocument();
  });

  it('will not complete the sale with an invalid mobile number', async () => {
    renderPanel();
    fireEvent.click(within(screen.getByText('Silver Ring').closest('li')!).getByRole('button', { name: /Add/ }));
    await screen.findByText('₹2,060.00');

    fireEvent.change(screen.getByLabelText('Customer mobile'), { target: { value: '12345' } });

    expect(screen.getByText('Enter a 10-digit mobile number.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /Complete sale/ })).toBeDisabled());
  });
});
