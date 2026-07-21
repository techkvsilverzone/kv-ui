import { api } from '../lib/api';

export interface SavingsEnrollmentPayload {
  monthlyAmount: number;
  duration: number;
  startDate: string;
}

export interface SavingsPayment {
  month: number;
  amount: number;
  paidAt: string;
}

export interface SavingsEnrollment {
  _id: string;
  /**
   * The owning customer. Populated as `{ _id, name, email }` on admin listings
   * (`GET /admin/savings`); a bare id string everywhere else (enroll/my-schemes/passbook
   * lookup never populate it — the caller already knows it's their own).
   */
  userId: string | { _id: string; name: string; email: string };
  /** Unique per-enrollment tracking number, e.g. "PB-00000042". One customer can hold
   * several concurrent schemes; the passbook number is what distinguishes them.
   * Unset until the scheme's first payment is recorded — enrollment alone does not
   * issue a passbook. */
  passbookNumber?: string;
  planName?: string;
  monthlyAmount: number;
  duration: number;
  startDate: string;
  status: string;
  totalPaid: number;
  bonusAmount: number;
  payments?: SavingsPayment[];
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
};
