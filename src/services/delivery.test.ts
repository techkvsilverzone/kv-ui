import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deliveryService } from './delivery';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('deliveryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checks a pincode against the public delivery endpoint', async () => {
    const result = { pincode: '600001', available: true, verified: true, city: 'Chennai', state: 'Tamil Nadu', deliveryFee: 150, estimatedDays: '5-7' };
    vi.mocked(api.get).mockResolvedValue(result);

    await expect(deliveryService.checkPincode('600001')).resolves.toEqual(result);
    expect(api.get).toHaveBeenCalledWith('/delivery/check?pincode=600001');
  });
});
