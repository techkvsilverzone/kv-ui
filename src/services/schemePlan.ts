import { api } from '../lib/api';

export type SchemeType = 'GOLD_11_1' | 'SILVER_11_1' | 'DIWALI' | 'GOLD_INCOME' | 'SILVER_DEPOSIT' | 'SILVER_SMART';
export type SchemeMetal = 'GOLD' | 'SILVER';
/** FIXED = pick one of `monthlyAmounts` at enrollment, pay it once per calendar month. FLEXIBLE
 * = "KV Smart Purchase Plan" (item 4) — pay any amount >= `minPaymentAmount`, any number of
 * times, any time within `durationMonths` of enrollment. */
export type SchemePaymentMode = 'FIXED' | 'FLEXIBLE';

export interface SchemeHamper {
  /** Hallmark purity of the gold portion of the payout, e.g. "916". Gold is a fixed ₹ VALUE
   * (see SchemePlan — computed at redemption from totalPaid + 1 bonus month, minus giftsValue
   * and the silver coin's value), not a fixed weight. */
  goldCoinPurity?: string;
  /** Fixed weight of the silver coin in the hamper — its ₹ value floats with the rate. */
  silverCoinGrams?: number;
  /** ₹ cost of the fixed gift package (crackers, sweets/savories, gifts) — flat per plan. */
  giftsValue?: number;
  gifts?: string[];
}

export interface SchemePlan {
  _id: string;
  type: SchemeType;
  name: string;
  description?: string;
  isActive: boolean;
  metal?: SchemeMetal;
  durationMonths: number;
  bonusMonths: number;
  paymentMode: SchemePaymentMode;
  /** FIXED plans only. */
  monthlyAmounts: number[];
  /** FLEXIBLE plans only — admin-configurable floor for a customer's self-chosen payment. */
  minPaymentAmount?: number;
  passbookPrefix: string;
  paymentDueDayOfMonth: number;
  earlyExitPenaltyPercent: number;
  maxConsecutiveMissedMonths?: number;
  redemptionMode: 'GOODS_ONLY' | 'CASH_ALLOWED';
  hamper?: SchemeHamper;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SchemePlanInput = Partial<Omit<SchemePlan, '_id' | 'createdAt' | 'updatedAt'>> & {
  type: SchemeType;
};

interface SchemePlansResponse {
  status?: string;
  data?: SchemePlan[];
}

export const schemePlanService = {
  /** Public storefront catalog — active plans only. */
  getPlans: async (): Promise<SchemePlan[]> => {
    const res = await api.get<SchemePlansResponse | SchemePlan[]>('/scheme-plans');
    return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
  },

  /** Admin catalog — includes inactive/draft plans. */
  getAllPlans: async (): Promise<SchemePlan[]> => {
    const res = await api.get<SchemePlansResponse | SchemePlan[]>('/admin/scheme-plans');
    return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
  },

  createPlan: async (payload: SchemePlanInput): Promise<SchemePlan> => {
    const res = await api.post<{ status?: string; data?: SchemePlan } | SchemePlan>('/admin/scheme-plans', payload);
    return (res as { data?: SchemePlan })?.data ?? (res as SchemePlan);
  },

  updatePlan: async (id: string, payload: Partial<SchemePlanInput>): Promise<SchemePlan> => {
    const res = await api.put<{ status?: string; data?: SchemePlan } | SchemePlan>(`/admin/scheme-plans/${id}`, payload);
    return (res as { data?: SchemePlan })?.data ?? (res as SchemePlan);
  },

  deletePlan: async (id: string): Promise<void> => {
    await api.delete(`/admin/scheme-plans/${id}`);
  },
};
