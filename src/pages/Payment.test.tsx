import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Payment from './Payment';
import { paymentService } from '@/services/payment';

// Cart with one ₹1,000 item; GST 3% => tax 30, total 1,030.
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    items: [{ id: 'p1', name: 'Silver Ring', price: 1000, quantity: 1, image: '' }],
    totalPrice: 1000,
    taxAmount: 30,
    clearCart: vi.fn(),
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'asha@example.com', name: 'Asha' } }),
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

vi.mock('@/services/payment', () => ({
  paymentService: { createRazorpayOrder: vi.fn(), verifyPayment: vi.fn() },
}));
vi.mock('@/services/coupon', () => ({ couponService: { applyCoupon: vi.fn() } }));
vi.mock('@/services/pricingConfig', () => ({
  pricingConfigService: { getPricingConfig: vi.fn().mockResolvedValue({ gstPercent: 3 }) },
  DEFAULT_PRICING_CONFIG: { gstPercent: 3 },
}));

const renderPayment = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/payment']}>
          <Payment />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
};

describe('Payment (checkout) page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the order summary with GST from pricing config', () => {
    renderPayment();
    expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument();
    // GST label reflects the configured percent, not a hardcoded value.
    expect(screen.getByText(/Tax \(GST 3%\)/i)).toBeInTheDocument();
    // Total = 1000 + 30 tax.
    expect(screen.getByRole('button', { name: /pay/i })).toHaveTextContent('1,030');
  });

  it('blocks payment and shows validation errors when the address is empty', async () => {
    renderPayment();
    fireEvent.click(screen.getByRole('button', { name: /pay/i }));

    // Inline validation errors appear and no order is created.
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
    expect(paymentService.createRazorpayOrder).not.toHaveBeenCalled();
    expect(paymentService.verifyPayment).not.toHaveBeenCalled();
  });

  it('does not send a client-computed amount to create-order (server prices it)', () => {
    // Guard: createRazorpayOrder must never be called with an `amount` field.
    renderPayment();
    expect(paymentService.createRazorpayOrder).not.toHaveBeenCalled();
  });
});
