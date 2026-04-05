import { api } from '../lib/api';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApplyCouponPayload {
  code: string;
  orderAmount: number;
}

export interface ApplyCouponResponse {
  valid: boolean;
  discount: number;
  message: string;
}

export interface CreateCouponPayload {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
}

export const couponService = {
  applyCoupon: async (payload: ApplyCouponPayload): Promise<ApplyCouponResponse> => {
    return api.post<ApplyCouponResponse>('/coupons/apply', payload);
  },

  // Admin
  getAllCoupons: async (): Promise<Coupon[]> => {
    const coupons = await api.get<(Coupon & { _id?: string })[]>('/admin/coupons');
    return coupons.map(c => ({ ...c, id: c.id || c._id || '' }));
  },

  createCoupon: async (payload: CreateCouponPayload): Promise<Coupon> => {
    return api.post<Coupon>('/admin/coupons', payload);
  },

  updateCoupon: async (id: string, payload: Partial<CreateCouponPayload>): Promise<Coupon> => {
    return api.put<Coupon>(`/admin/coupons/${id}`, payload);
  },

  deleteCoupon: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/coupons/${id}`);
  },

  toggleCoupon: async (id: string, isActive: boolean): Promise<Coupon> => {
    return api.put<Coupon>(`/admin/coupons/${id}`, { isActive });
  },
};
