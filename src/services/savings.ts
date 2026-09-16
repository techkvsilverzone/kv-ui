import { api } from '../lib/api';
import { SchemeMetal, SchemeType } from './schemePlan';

export interface SavingsEnrollmentPayload {
  schemeType: SchemeType;
  monthlyAmount: number;
  startDate: string;
  /** Item 2 (replaced 2026-09-16, was KYC-gated): from POST /savings/enroll/request-otp. */
  otp: string;
}

export interface SavingsPayment {
  month: number;
  /** Cash actually collected this row. 0 on the auto-credited bonus/devident row. */
  amount: number;
  paidAt: string;
  /** ₹/gram used to convert `amount` into the scheme's metal — 0 on the bonus row. */
  materialRate: number;
  /** `amount / materialRate`, 3dp — 0 on the bonus row. */
  materialWeight: number;
  /** Dividend/bonus ₹ credited on this row, if any. 0 on ordinary collection rows. */
  devidentAmount: number;
  /** ₹/gram used to convert `devidentAmount` into the scheme's metal. 0 when there's no devident. */
  devidentMaterialRate: number;
  /** `devidentAmount / devidentMaterialRate`, 3dp. 0 when there's no devident. */
  devidentMaterialWeight: number;
  method?: 'ONLINE' | 'CASH';
  dueMonthKey?: string;
}

export interface MaturityBenefits {
  /** ₹ value of the gold portion of the payout. For DIWALI this is computed at redemption
   * (totalPaid + 1 bonus month, minus giftsValue and the silver coin's value) — NOT set until
   * an admin runs the redemption compute action once the scheme is Completed. */
  goldCoinValue?: number;
  /** Grams of gold `goldCoinValue` bought at `goldRatePerGram` — the actual weight handed over. */
  goldGrams?: number;
  goldRatePerGram?: number;
  /** Grams of silver coin/article awarded at scheme maturity (fixed weight). */
  silverGrams?: number;
  /** ₹ value of `silverGrams` at `silverRatePerGram`, as of redemption. */
  silverValue?: number;
  silverRatePerGram?: number;
  /** ₹ cost of the fixed gift package. */
  giftsValue?: number;
  /** Free-text extras, e.g. ["Crackers Box", "Sweets and Snacks"]. */
  gifts?: string[];
  /** When the DIWALI redemption payout was computed. Unset until then. */
  computedAt?: string;
}

/** Card rule 6: the early-exit forfeit/redeemable split, set once a scheme is cancelled. */
export interface SavingsCancellation {
  cancelledAt: string;
  amountPaidAtCancellation: number;
  penaltyPercent: number;
  penaltyAmount: number;
  giftsValueDeducted: number;
  netRedeemable: number;
  note?: string;
}

export interface SavingsEnrollment {
  _id: string;
  /**
   * The owning customer. Populated as `{ _id, name, email }` on admin listings
   * (`GET /admin/savings`); a bare id string everywhere else (enroll/my-schemes/passbook
   * lookup never populate it — the caller already knows it's their own).
   */
  userId: string | { _id: string; name: string; email: string };
  /** Unique per-enrollment tracking number ("Ticket No" on the printed passbook), e.g.
   * "SLV-2425-0000111" (metal/scheme prefix + financial-year code + sequence). One customer
   * can hold several concurrent schemes; the passbook number is what distinguishes them.
   * Unset until the scheme's first payment is recorded. */
  passbookNumber?: string;
  /** Which catalog product this enrollment is under — drives the ledger/passbook layout. */
  schemeType: SchemeType;
  planId?: string;
  /** Which metal installments accumulate as. Unset for DIWALI (fixed hamper, not gram-based). */
  metal?: SchemeMetal;
  planName?: string;
  monthlyAmount: number;
  duration: number;
  startDate: string;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Dropped';
  totalPaid: number;
  bonusAmount: number;
  payments?: SavingsPayment[];
  /** Admin-configurable reward shown on the passbook once the scheme matures. For DIWALI this
   * is the hamper snapshotted at enrollment. */
  maturityBenefits?: MaturityBenefits;
  cancellation?: SavingsCancellation;
  /** Computed at read time — card rule 2: a late payment pushes this out by however many
   * months it slipped. Never stored. */
  maturityDate?: string;
  createdAt: string;
}

/** Admin-only passbook correction — every field optional, only present fields are changed.
 * The passbook number itself is never editable (it's the tracking key already handed out). */
export interface SavingsAdminUpdatePayload {
  planName?: string;
  schemeType?: SchemeType;
  metal?: SchemeMetal | null;
  monthlyAmount?: number;
  duration?: number;
  bonusAmount?: number;
  totalPaid?: number;
  status?: 'Active' | 'Completed' | 'Cancelled' | 'Dropped';
  startDate?: string;
  maturityBenefits?: MaturityBenefits;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface RazorpayVerification {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const savingsService = {
  /** Item 2 (replaced 2026-09-16): request the confirmation code enroll() now requires. */
  requestEnrollOtp: async (): Promise<{ message: string; channel: 'whatsapp' | 'email' }> => {
    return api.post('/savings/enroll/request-otp', {});
  },

  enroll: async (payload: SavingsEnrollmentPayload): Promise<SavingsEnrollment> => {
    return api.post<SavingsEnrollment>('/savings/enroll', payload);
  },

  getMySchemes: async (): Promise<SavingsEnrollment[]> => {
    return api.get<SavingsEnrollment[]>('/savings/my-schemes');
  },

  /** Track a specific scheme by its passbook number (own schemes only, unless staff/admin). */
  getByPassbookNumber: async (passbookNumber: string): Promise<SavingsEnrollment> => {
    return api.get<SavingsEnrollment>(`/savings/passbook/${encodeURIComponent(passbookNumber.trim())}`);
  },

  /** Step 1 of paying online. For a FIXED-mode scheme the amount is always the scheme's own
   * monthlyAmount (server-computed, never client input) — `amount` is ignored. For a FLEXIBLE-
   * mode scheme (item 4, KV Smart Purchase Plan) `amount` is REQUIRED and must be >= the plan's
   * minimum. */
  createInstallmentOrder: async (schemeId: string, amount?: number): Promise<RazorpayOrder> => {
    return api.post<RazorpayOrder>(`/savings/${schemeId}/pay/create-order`, amount !== undefined ? { amount } : {});
  },

  /** Step 2: verify the Razorpay payment and record it on the ledger. */
  verifyInstallmentPayment: async (
    schemeId: string,
    payload: RazorpayVerification,
  ): Promise<{ success: boolean; scheme: SavingsEnrollment }> => {
    return api.post(`/savings/${schemeId}/pay/verify`, payload);
  },
};
