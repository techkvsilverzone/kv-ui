import { api } from '../lib/api';

/**
 * Gold-rate domain. Mirrors {@link ../services/silverRate} against the `/gold-rates`
 * endpoints (now live — see docs/25-price-update-guard-and-notification.md). The gold
 * response carries both `date` and `rateDate`; purity is pinned server-side to 22K
 * hallmark (916), so the POST `purity` is accepted but not persisted as a free string.
 */
export interface GoldRate {
  id: string;
  date: string;
  ratePerGram: number;
  ratePerKg: number;
  purity: string;
  updatedBy?: string;
  createdAt?: string;
}

interface ApiGoldRate extends Partial<GoldRate> {
  _id?: string;
  /** The server emits the rate date as both `date` and `rateDate`. */
  rateDate?: string;
}

const normalizeRate = (r: ApiGoldRate): GoldRate => ({
  ...r,
  id: r.id ?? r._id ?? '',
  // Prefer an explicit rate date (`date` or `rateDate`), else fall back to createdAt.
  date: r.date ?? r.rateDate ?? r.createdAt ?? '',
  ratePerGram: r.ratePerGram ?? 0,
  ratePerKg: r.ratePerKg ?? 0,
  purity: r.purity ?? '',
});

export interface UpdateGoldRatePayload {
  ratePerGram: number;
  purity: string;
}

export const goldRateService = {
  getTodayRate: async (): Promise<GoldRate[]> => {
    const data = await api.get<ApiGoldRate[]>('/gold-rates/today');
    return data.map(normalizeRate);
  },

  getRateHistory: async (days: number = 30): Promise<GoldRate[]> => {
    const data = await api.get<ApiGoldRate[]>(`/gold-rates/history?days=${days}`);
    return data.map(normalizeRate);
  },

  // Admin
  updateRate: async (payload: UpdateGoldRatePayload): Promise<GoldRate> => {
    const data = await api.post<ApiGoldRate>('/admin/gold-rates', payload);
    return normalizeRate(data);
  },

  getAllRates: async (): Promise<GoldRate[]> => {
    const data = await api.get<ApiGoldRate[]>('/admin/gold-rates');
    return data.map(normalizeRate);
  },
};
