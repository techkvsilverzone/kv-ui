import { api } from '../lib/api';

export interface SavingsEnrollmentPayload {
  monthlyAmount: number;
  duration: number;
  startDate: string;
}

export interface SavingsPayment {
  month: number;
  /** Cash actually collected this row. 0 on the auto-credited bonus/devident row. */
  amount: number;
  paidAt: string;
  /** ₹/gram used to convert `amount` into silver — 0 on the bonus row (no real collection). */
  materialRate: number;
  /** `amount / materialRate`, 3dp — 0 on the bonus row. */
  materialWeight: number;
  /** Dividend/bonus ₹ credited on this row, if any. 0 on ordinary collection rows. */
  devidentAmount: number;
  /** ₹/gram used to convert `devidentAmount` into silver. 0 when there's no devident. */
  devidentMaterialRate: number;
  /** `devidentAmount / devidentMaterialRate`, 3dp. 0 when there's no devident. */
  devidentMaterialWeight: number;
}

export interface MaturityBenefits {
  /** ₹ value of the gold coin awarded at scheme maturity. */
  goldCoinValue?: number;
  /** Grams of silver coin/article awarded at scheme maturity. */
  silverGrams?: number;
  /** Free-text extras, e.g. ["Crackers Box", "Sweets and Snacks"]. */
  gifts?: string[];
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
   * "2425-0000111" (financial-year prefix + sequence). One customer can hold several
   * concurrent schemes; the passbook number is what distinguishes them. Unset until the
   * scheme's first payment is recorded — enrollment alone does not issue a passbook. */
  passbookNumber?: string;
  planName?: string;
  monthlyAmount: number;
  duration: number;
  startDate: string;
  status: string;
  totalPaid: number;
  bonusAmount: number;
  payments?: SavingsPayment[];
  /** Admin-configurable reward shown on the passbook once the scheme matures. */
  maturityBenefits?: MaturityBenefits;
  createdAt: string;
}

/** Admin-only passbook correction — every field optional, only present fields are changed.
 * The passbook number itself is never editable (it's the tracking key already handed out). */
export interface SavingsAdminUpdatePayload {
  planName?: string;
  monthlyAmount?: number;
  duration?: number;
  bonusAmount?: number;
  totalPaid?: number;
  status?: 'Active' | 'Completed' | 'Cancelled';
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

  /** Step 1 of paying this month's installment online: create a Razorpay order for the
   * scheme's monthly amount (server-computed, never client input). */
  createInstallmentOrder: async (schemeId: string): Promise<RazorpayOrder> => {
    return api.post<RazorpayOrder>(`/savings/${schemeId}/pay/create-order`, {});
  },

  /** Step 2: verify the Razorpay payment and record it on the ledger. */
  verifyInstallmentPayment: async (
    schemeId: string,
    payload: RazorpayVerification,
  ): Promise<{ success: boolean; scheme: SavingsEnrollment }> => {
    return api.post(`/savings/${schemeId}/pay/verify`, payload);
  },
};
