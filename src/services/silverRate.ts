import { api } from '../lib/api';

export interface SilverRate {
  id: string;
  date: string;
  ratePerGram: number;
  ratePerKg: number;
  purity: string;
  updatedBy?: string;
  createdAt?: string;
}

interface ApiSilverRate extends Partial<SilverRate> {
  _id?: string;
  /** The server emits the rate date as `rateDate`; older/spec shapes use `date`. */
  rateDate?: string;
}

const normalizeRate = (r: ApiSilverRate): SilverRate => ({
  ...r,
  id: r.id ?? r._id ?? '',
  // Prefer an explicit rate date (`date` or the server's `rateDate`), else fall back to createdAt.
  date: r.date ?? r.rateDate ?? r.createdAt ?? '',
  ratePerGram: r.ratePerGram ?? 0,
  ratePerKg: r.ratePerKg ?? 0,
  purity: r.purity ?? '',
});

export interface UpdateSilverRatePayload {
  ratePerGram: number;
  purity: string;
}

export const silverRateService = {
  getTodayRate: async (): Promise<SilverRate[]> => {
    const data = await api.get<ApiSilverRate[]>('/silver-rates/today');
    return data.map(normalizeRate);
  },

  getRateHistory: async (days: number = 30): Promise<SilverRate[]> => {
    const data = await api.get<ApiSilverRate[]>(`/silver-rates/history?days=${days}`);
    return data.map(normalizeRate);
  },

  // Admin
  updateRate: async (payload: UpdateSilverRatePayload): Promise<SilverRate> => {
    const data = await api.post<ApiSilverRate>('/admin/silver-rates', payload);
    return normalizeRate(data);
  },

  getAllRates: async (): Promise<SilverRate[]> => {
    const data = await api.get<ApiSilverRate[]>('/admin/silver-rates');
    return data.map(normalizeRate);
  },
};
