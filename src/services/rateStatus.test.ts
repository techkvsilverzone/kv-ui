import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rateStatusService } from './rateStatus';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('rateStatusService.getRateStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the authoritative flag from /admin/rate-status (bare object)', async () => {
    vi.mocked(api.get).mockResolvedValue({
      blocked: true,
      staleMetals: ['silver'],
      checkedAt: '2026-06-16T10:00:00.000Z',
    });

    const status = await rateStatusService.getRateStatus();

    expect(api.get).toHaveBeenCalledWith('/admin/rate-status');
    expect(status).toEqual({
      blocked: true,
      staleMetals: ['silver'],
      checkedAt: '2026-06-16T10:00:00.000Z',
    });
  });

  it('unwraps a { status, data } envelope', async () => {
    vi.mocked(api.get).mockResolvedValue({
      status: 'success',
      data: { blocked: false, staleMetals: [], checkedAt: '2026-06-16T10:00:00.000Z' },
    });

    const status = await rateStatusService.getRateStatus();

    expect(status.blocked).toBe(false);
    expect(status.staleMetals).toEqual([]);
  });

  it('drops unknown metal names and tolerates missing fields', async () => {
    vi.mocked(api.get).mockResolvedValue({ staleMetals: ['gold', 'platinum'] });

    const status = await rateStatusService.getRateStatus();

    expect(status.blocked).toBe(false);
    expect(status.staleMetals).toEqual(['gold']);
    expect(status.checkedAt).toBe('');
  });
});
