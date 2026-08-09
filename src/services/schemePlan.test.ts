import { beforeEach, describe, expect, it, vi } from 'vitest';
import { schemePlanService } from './schemePlan';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('schemePlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps the {status,data} envelope from GET /scheme-plans', async () => {
    vi.mocked(api.get).mockResolvedValue({ status: 'success', data: [{ _id: 'p1', type: 'SILVER_11_1' }] });

    const plans = await schemePlanService.getPlans();

    expect(api.get).toHaveBeenCalledWith('/scheme-plans');
    expect(plans).toEqual([{ _id: 'p1', type: 'SILVER_11_1' }]);
  });

  it('tolerates a bare array response', async () => {
    vi.mocked(api.get).mockResolvedValue([{ _id: 'p1', type: 'DIWALI' }]);

    const plans = await schemePlanService.getPlans();

    expect(plans).toEqual([{ _id: 'p1', type: 'DIWALI' }]);
  });

  it('returns an empty array when the response has no usable data', async () => {
    vi.mocked(api.get).mockResolvedValue({ status: 'success' } as never);

    expect(await schemePlanService.getPlans()).toEqual([]);
  });
});
