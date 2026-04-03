import { beforeEach, describe, expect, it, vi } from 'vitest';
import { couponService } from './coupon';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('couponService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies coupon for order amount', async () => {
    vi.mocked(api.post).mockResolvedValue({ valid: true, discount: 50, message: 'ok' });

    const result = await couponService.applyCoupon({ code: 'SAVE5', orderAmount: 1000 });

    expect(api.post).toHaveBeenCalledWith('/coupons/apply', { code: 'SAVE5', orderAmount: 1000 });
    expect(result.valid).toBe(true);
  });

  it('supports admin coupon CRUD endpoints', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 'c1' });
    vi.mocked(api.put).mockResolvedValue({ id: 'c1' });
    vi.mocked(api.delete).mockResolvedValue(undefined);

    await couponService.createCoupon({
      code: 'SMOKE',
      description: 'desc',
      discountType: 'percentage',
      discountValue: 5,
      minOrderAmount: 500,
      maxDiscount: 100,
      validFrom: '2026-04-01',
      validTo: '2026-04-30',
      usageLimit: 20,
    });
    await couponService.updateCoupon('c1', { discountValue: 10 });
    await couponService.toggleCoupon('c1', false);
    await couponService.deleteCoupon('c1');

    expect(api.post).toHaveBeenCalledWith('/admin/coupons', expect.objectContaining({ code: 'SMOKE' }));
    expect(api.put).toHaveBeenCalledWith('/admin/coupons/c1', { discountValue: 10 });
    expect(api.put).toHaveBeenCalledWith('/admin/coupons/c1', { isActive: false });
    expect(api.delete).toHaveBeenCalledWith('/admin/coupons/c1');
  });
});
