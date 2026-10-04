import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import SchemeDetailsView from './SchemeDetailsView';
import type { SavingsEnrollment, SavingsPayment } from '@/services/savings';

const pay = (id: string, paidAt: string, materialRate: number, materialWeight: number, extra: Partial<SavingsPayment> = {}): SavingsPayment => ({
  id,
  month: 0,
  amount: 1000,
  paidAt,
  materialRate,
  materialWeight,
  devidentAmount: 0,
  devidentMaterialRate: 0,
  devidentMaterialWeight: 0,
  method: 'ONLINE',
  ...extra,
});

const scheme: SavingsEnrollment = {
  _id: 's1',
  userId: 'u1',
  passbookNumber: 'SLV-0007',
  schemeType: 'SILVER_11_1',
  metal: 'SILVER',
  planName: 'Silver 11+1',
  monthlyAmount: 1000,
  duration: 11,
  startDate: '2026-01-05T00:00:00Z',
  createdAt: '2026-01-05T00:00:00Z',
  maturityDate: '2026-12-05T00:00:00Z',
  status: 'Active',
  totalPaid: 3000,
  bonusAmount: 1000,
  payments: [
    pay('101', '2026-01-05T00:00:00Z', 250, 4),
    pay('102', '2026-02-05T00:00:00Z', 240, 4.167, { method: 'CASH' }),
    pay('103', '2026-03-05T00:00:00Z', 260, 3.846),
  ],
};

describe('SchemeDetailsView', () => {
  it('shows the summary the business asked for: paid, grams, paid and pending months', () => {
    render(<SchemeDetailsView scheme={scheme} userName="Vino" />);

    expect(screen.getByText('₹3,000')).toBeInTheDocument();
    expect(screen.getByText('12.013 g')).toBeInTheDocument();
    expect(screen.getByText('3 of 11')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '27% complete, 3 of 11 paid' })).toBeInTheDocument();
  });

  it('lists month-wise history newest first with rate, amount, grams, mode and receipt number', () => {
    render(<SchemeDetailsView scheme={scheme} />);

    const cards = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(cards.map((c) => within(c).getByText(/^Month \d+$/).textContent)).toEqual(['Month 3', 'Month 2', 'Month 1']);

    const month2 = cards[1];
    expect(within(month2).getByText('₹240')).toBeInTheDocument();
    expect(within(month2).getByText('4.167 g')).toBeInTheDocument();
    expect(within(month2).getByText(/Paid in store/)).toBeInTheDocument();
    expect(within(month2).getByText('Receipt No. 102')).toBeInTheDocument();
    expect(within(month2).getByRole('button', { name: 'Download receipt for Month 2' })).toBeInTheDocument();
  });

  it('labels the Pay button with the month being paid', () => {
    const onPay = vi.fn();
    render(<SchemeDetailsView scheme={scheme} onPay={onPay} />);

    fireEvent.click(screen.getByRole('button', { name: 'Pay Month 4 of 11 (₹1,000)' }));
    expect(onPay).toHaveBeenCalled();
  });

  it('hides Pay when there is nothing due and grams for a metal-less (Diwali) scheme', () => {
    render(<SchemeDetailsView scheme={{ ...scheme, schemeType: 'DIWALI', metal: undefined, status: 'Completed' }} onPay={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /^Pay Month/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/ g$/)).not.toBeInTheDocument();
    expect(screen.queryByText('Rate /g')).not.toBeInTheDocument();
  });
});
