import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deliveryConfigService,
  resolveDeliveryZone,
  getDeliveryCharge,
  DEFAULT_DELIVERY_CONFIG,
} from './deliveryConfig';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('deliveryConfig zone resolution', () => {
  it('classifies Chennai as the chennai zone (case-insensitive)', () => {
    expect(resolveDeliveryZone({ city: 'Chennai', state: 'Tamil Nadu' })).toBe('chennai');
    expect(resolveDeliveryZone({ city: ' chennai ', state: 'TAMIL NADU' })).toBe('chennai');
  });

  it('classifies other Tamil Nadu cities as otherDistrict', () => {
    expect(resolveDeliveryZone({ city: 'Coimbatore', state: 'Tamil Nadu' })).toBe('otherDistrict');
  });

  it('classifies other states as otherState', () => {
    expect(resolveDeliveryZone({ city: 'Bengaluru', state: 'Karnataka' })).toBe('otherState');
    expect(resolveDeliveryZone({})).toBe('otherState');
  });

  it('maps a destination to the configured charge', () => {
    const cfg = { chennai: 100, otherDistrict: 175, otherState: 300 };
    expect(getDeliveryCharge(cfg, { city: 'Chennai', state: 'Tamil Nadu' })).toBe(100);
    expect(getDeliveryCharge(cfg, { city: 'Madurai', state: 'Tamil Nadu' })).toBe(175);
    expect(getDeliveryCharge(cfg, { city: 'Mumbai', state: 'Maharashtra' })).toBe(300);
  });
});

describe('deliveryConfigService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps a { status, data } response', async () => {
    vi.mocked(api.get).mockResolvedValue({ status: 'success', data: { chennai: 120, otherDistrict: 210, otherState: 260 } });

    const cfg = await deliveryConfigService.getDeliveryConfig();

    expect(cfg).toEqual({ chennai: 120, otherDistrict: 210, otherState: 260 });
  });

  it('falls back to defaults on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('boom'));

    const cfg = await deliveryConfigService.getDeliveryConfig();

    expect(cfg).toEqual(DEFAULT_DELIVERY_CONFIG);
  });

  it('fills missing fields with defaults', async () => {
    vi.mocked(api.get).mockResolvedValue({ chennai: 99 });

    const cfg = await deliveryConfigService.getDeliveryConfig();

    expect(cfg).toEqual({
      chennai: 99,
      otherDistrict: DEFAULT_DELIVERY_CONFIG.otherDistrict,
      otherState: DEFAULT_DELIVERY_CONFIG.otherState,
    });
  });
});
