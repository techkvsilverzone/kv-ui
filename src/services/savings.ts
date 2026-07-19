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
  user: string;
  /** Unique per-enrollment tracking number, e.g. "PB-00000042". One customer can hold
   * several concurrent schemes; the passbook number is what distinguishes them. */
  passbookNumber: string;
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
