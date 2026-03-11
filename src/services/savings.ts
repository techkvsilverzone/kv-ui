import { api } from '../lib/api';

export interface SavingsEnrollmentPayload {
  monthlyAmount: number;
  duration: number;
  startDate: string;
}

export interface SavingsEnrollment {
  _id: string;
  user: string;
  monthlyAmount: number;
  duration: number;
  startDate: string;
  status: string;
  totalPaid: number;
  bonusAmount: number;
  createdAt: string;
}

export const savingsService = {
  enroll: async (payload: SavingsEnrollmentPayload): Promise<SavingsEnrollment> => {
    return api.post<SavingsEnrollment>('/savings/enroll', payload);
  },

  getMySchemes: async (): Promise<SavingsEnrollment[]> => {
    return api.get<SavingsEnrollment[]>('/savings/my-schemes');
  },
};
