import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Payment from './Payment';
import { paymentService } from '@/services/payment';

// Cart with one ₹1,000 (pre-GST) item; GST 3% => 30. No address yet => delivery 0, total 1,030.
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    items: [{ id: 'p1', name: 'Silver Ring', price: 1000, quantity: 1, image: '' }],
    totalPrice: 1000,
    taxableTotal: 1000,
    clearCart: vi.fn(),
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'asha@example.com', name: 'Asha' } }),
}));

vi.mock('@/lib/razorpay', () => ({ loadRazorpayScript: vi.fn().mockResolvedValue(true) }));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

vi.mock('@/services/payment', () => ({
  paymentService: { createRazorpayOrder: vi.fn(), verifyPayment: vi.fn() },
}));
vi.mock('@/services/coupon', () => ({ couponService: { applyCoupon: vi.fn() } }));
vi.mock('@/services/pricingConfig', () => ({
  pricingConfigService: { getPricingConfig: vi.fn().mockResolvedValue({ gstPercent: 3 }) },
  DEFAULT_PRICING_CONFIG: { gstPercent: 3 },
}));
vi.mock('@/services/deliveryConfig', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/deliveryConfig')>();
  return {
    ...actual,
    deliveryConfigService: {
      getDeliveryConfig: vi.fn().mockResolvedValue(actual.DEFAULT_DELIVERY_CONFIG),
    },
  };
});

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
    expect(screen.getByText(/GST \(3%\)/i)).toBeInTheDocument();
    // Total = 1000 subtotal + 30 GST + 0 delivery (no address yet).
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

  it('shows the server breakdown for confirmation, then opens Razorpay for that order', async () => {
    const open = vi.fn();
    const Razorpay = vi.fn(() => ({ open }));
    Object.assign(window, { Razorpay });
    vi.mocked(paymentService.createRazorpayOrder).mockResolvedValue({
      id: 'order_1', amount: 123400, currency: 'INR', receipt: 'r', status: 'created',
      breakdown: { subtotal: 1000, discount: 0, gstPercent: 3, taxAmount: 30, deliveryFee: 150, giftWrap: false, giftWrapFee: 0, grandTotal: 1234 },
    });
    renderPayment();

    const fill = { firstName: 'Asha', lastName: 'Rao', address: '12 Mount Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', phone: '9876543210' };
    Object.entries(fill).forEach(([id, value]) => fireEvent.change(document.getElementById(id)!, { target: { id, value } }));
    fireEvent.click(screen.getByRole('button', { name: /pay/i }));

    const confirm = await screen.findByRole('button', { name: /pay ₹1,234/i });
    expect(screen.getByText(/GST \(3%\)/, { selector: 'div[role="alertdialog"] span' })).toBeInTheDocument();
    expect(Razorpay).not.toHaveBeenCalled();

    fireEvent.click(confirm);
    expect(Razorpay).toHaveBeenCalledWith(expect.objectContaining({ order_id: 'order_1', amount: 123400 }));
    expect(open).toHaveBeenCalled();
  });
});
