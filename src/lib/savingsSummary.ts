import type { SavingsEnrollment, SavingsPayment } from '@/services/savings';

export interface Installment {
  /** 1-based month number for a collected installment; null for the auto-credited bonus month. */
  monthNumber: number | null;
  payment: SavingsPayment;
  /** Grams credited by this row, including any bonus (devident) weight. */
  grams: number;
}

export interface SchemeSummary {
  totalMonths: number;
  paidMonths: number;
  pendingMonths: number;
  /** The month the next payment pays for, or null when nothing more is due. */
  nextMonth: number | null;
  progressPercent: number;
  totalPaid: number;
  totalGrams: number;
  /** False for metal-less schemes (Diwali), whose payout isn't grams. */
  hasGrams: boolean;
  /** Oldest first. */
  installments: Installment[];
}

/**
 * Month-by-month picture of a FIXED savings scheme (one installment per month for `duration`
 * months). Not meaningful for FLEXIBLE plans, where payments aren't tied to months.
 */
export function summarizeScheme(scheme: SavingsEnrollment): SchemeSummary {
  const sorted = (scheme.payments ?? [])
    .slice()
    .sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime());

  let monthCounter = 0;
  const installments = sorted.map((payment) => ({
    monthNumber: payment.amount > 0 ? ++monthCounter : null,
    payment,
    grams: payment.materialWeight + payment.devidentMaterialWeight,
  }));

  const totalMonths = scheme.duration;
  const paidMonths = monthCounter;
  const isActive = scheme.status === 'Active';
  const pendingMonths = isActive ? Math.max(0, totalMonths - paidMonths) : 0;

  return {
    totalMonths,
    paidMonths,
    pendingMonths,
    nextMonth: isActive && paidMonths < totalMonths ? paidMonths + 1 : null,
    progressPercent: totalMonths > 0 ? Math.min(100, Math.round((paidMonths / totalMonths) * 100)) : 0,
    totalPaid: scheme.totalPaid,
    totalGrams: Math.round(installments.reduce((sum, i) => sum + i.grams, 0) * 1000) / 1000,
    hasGrams: !!scheme.metal,
    installments,
  };
}
