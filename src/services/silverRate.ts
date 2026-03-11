import { api } from '../lib/api';

export interface SilverRate {
  id: string;
  date: string;
  ratePerGram: number;
  ratePerKg: number;
  purity: string;
  updatedBy?: string;
  createdAt: string;
}

export interface UpdateSilverRatePayload {
  ratePerGram: number;
  purity: string;
}

export const silverRateService = {
  getTodayRate: async (): Promise<SilverRate[]> => {
    return api.get<SilverRate[]>('/silver-rates/today');
  },

  getRateHistory: async (days: number = 30): Promise<SilverRate[]> => {
    return api.get<SilverRate[]>(`/silver-rates/history?days=${days}`);
  },

  // Admin
  updateRate: async (payload: UpdateSilverRatePayload): Promise<SilverRate> => {
    return api.post<SilverRate>('/admin/silver-rates', payload);
  },

  getAllRates: async (): Promise<SilverRate[]> => {
    return api.get<SilverRate[]>('/admin/silver-rates');
  },
};
