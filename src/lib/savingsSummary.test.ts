import { describe, expect, it } from 'vitest';
import { summarizeScheme } from './savingsSummary';
import type { SavingsEnrollment, SavingsPayment } from '@/services/savings';

const payment = (paidAt: string, amount: number, grams: number, extra: Partial<SavingsPayment> = {}): SavingsPayment => ({
  month: 0,
  amount,
  paidAt,
  materialRate: amount ? 250 : 0,
  materialWeight: grams,
  devidentAmount: 0,
  devidentMaterialRate: 0,
  devidentMaterialWeight: 0,
  ...extra,
});

const scheme = (overrides: Partial<SavingsEnrollment> = {}): SavingsEnrollment => ({
  _id: 's1',
  userId: 'u1',
  schemeType: 'SILVER_11_1',
  metal: 'SILVER',
  monthlyAmount: 1000,
  duration: 11,
  startDate: '2026-01-05T00:00:00Z',
  createdAt: '2026-01-05T00:00:00Z',
  status: 'Active',
  totalPaid: 0,
  bonusAmount: 1000,
  payments: [],
  ...overrides,
});

describe('summarizeScheme', () => {
  it('numbers installments by payment date and counts paid/pending months', () => {
    const s = summarizeScheme(
      scheme({
        totalPaid: 3000,
        payments: [
          payment('2026-03-05T00:00:00Z', 1000, 4),
          payment('2026-01-05T00:00:00Z', 1000, 4.2),
          payment('2026-02-05T00:00:00Z', 1000, 4.1),
        ],
      }),
    );

    expect(s.installments.map((i) => [i.monthNumber, i.payment.paidAt.slice(0, 7)])).toEqual([
      [1, '2026-01'],
      [2, '2026-02'],
      [3, '2026-03'],
    ]);
    expect(s).toMatchObject({ paidMonths: 3, pendingMonths: 8, nextMonth: 4, progressPercent: 27, totalPaid: 3000, totalGrams: 12.3 });
  });

  it('labels the bonus row as unnumbered and adds its grams', () => {
    const payments = Array.from({ length: 11 }, (_, i) => payment(`2026-${String(i + 1).padStart(2, '0')}-05T00:00:00Z`, 1000, 4));
    payments.push(payment('2026-11-06T00:00:00Z', 0, 0, { devidentAmount: 1000, devidentMaterialRate: 250, devidentMaterialWeight: 4 }));

    const s = summarizeScheme(scheme({ status: 'Completed', totalPaid: 11000, payments }));

    expect(s.installments.at(-1)!.monthNumber).toBeNull();
    expect(s).toMatchObject({ paidMonths: 11, pendingMonths: 0, nextMonth: null, progressPercent: 100, totalGrams: 48 });
  });

  it('has no grams for a metal-less (Diwali) scheme and nothing pending once cancelled', () => {
    const s = summarizeScheme(
      scheme({ schemeType: 'DIWALI', metal: undefined, status: 'Cancelled', payments: [payment('2026-01-05T00:00:00Z', 1000, 0)] }),
    );

    expect(s).toMatchObject({ hasGrams: false, paidMonths: 1, pendingMonths: 0, nextMonth: null });
  });
});
