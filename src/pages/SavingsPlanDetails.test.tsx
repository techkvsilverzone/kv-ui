import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SavingsEnrollment } from '@/services/savings';
import SavingsPlanDetails from './SavingsPlanDetails';

const auth = vi.hoisted(() => ({ user: { _id: '37', name: 'Vino', email: 'vino@example.com', phone: '8190858375' } }));
const getByPassbookNumber = vi.hoisted(() => vi.fn());

vi.mock('@/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('@/components/Seo', () => ({ default: () => null }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/services/savings', () => ({ savingsService: { getByPassbookNumber } }));
vi.mock('@/services/schemePlan', () => ({
  schemePlanService: { getPlans: async () => [{ type: 'SILVER_11_1', paymentMode: 'FIXED' }] },
}));
vi.mock('@/services/address', () => ({ addressService: { getAddresses: async () => [] } }));

const scheme = (ownerId: string, ownerName: string, ownerPhone: string): SavingsEnrollment => ({
  _id: 's1',
  userId: { _id: ownerId, name: ownerName, email: 'x@example.com', phone: ownerPhone },
  passbookNumber: 'SLV-0007',
  schemeType: 'SILVER_11_1',
  metal: 'SILVER',
  planName: 'Silver 11+1',
  monthlyAmount: 1000,
  duration: 11,
  startDate: '2026-01-05T00:00:00Z',
  createdAt: '2026-01-05T00:00:00Z',
  status: 'Active',
  totalPaid: 0,
  bonusAmount: 1000,
  payments: [],
});

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/savings-scheme/passbook/SLV-0007']}>
        <Routes>
          <Route path="/savings-scheme/passbook/:passbookNumber" element={<SavingsPlanDetails />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('SavingsPlanDetails page', () => {
  beforeEach(() => getByPassbookNumber.mockReset());

  it('shows the owner their plan with mobile number and a Pay button', async () => {
    getByPassbookNumber.mockResolvedValue(scheme('37', 'Vino', '8190858375'));
    renderPage();

    expect(await screen.findByText('Mobile +91 8190858375')).toBeInTheDocument();
    expect(getByPassbookNumber).toHaveBeenCalledWith('SLV-0007');
    expect(screen.getByRole('button', { name: 'Pay Month 1 of 11 (₹1,000)' })).toBeInTheDocument();
  });

  it("shows staff the customer's name and mobile, not their own, and no Pay button", async () => {
    getByPassbookNumber.mockResolvedValue(scheme('99', 'Kalyana Sundaram', '9092224666'));
    renderPage();

    expect(await screen.findByText('Mobile +91 9092224666')).toBeInTheDocument();
    expect(screen.getAllByText('Kalyana Sundaram').length).toBeGreaterThan(0);
    expect(screen.queryByText('Mobile +91 8190858375')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Pay Month/ })).not.toBeInTheDocument();
  });
});
