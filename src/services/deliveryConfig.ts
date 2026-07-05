import { api } from '../lib/api';

/**
 * Zone-based delivery charges (in ₹). Zones are resolved from the destination address:
 * Chennai (home city) → otherDistrict (same state, outside Chennai) → otherState (different state).
 */
export interface DeliveryConfig {
  chennai: number;
  otherDistrict: number;
  otherState: number;
}

/** Fallback used before the config loads or if the request fails. */
export const DEFAULT_DELIVERY_CONFIG: DeliveryConfig = {
  chennai: 150,
  otherDistrict: 200,
  otherState: 250,
};

/** Home location used to classify a destination into a delivery zone. */
export const HOME_CITY = 'chennai';
export const HOME_STATE = 'tamil nadu';

interface ApiDeliveryConfig {
  chennai?: number;
  otherDistrict?: number;
  otherState?: number;
}

interface DeliveryConfigResponse {
  status?: string;
  data?: ApiDeliveryConfig;
}

const numOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const parseConfig = (cfg?: ApiDeliveryConfig): DeliveryConfig => ({
  chennai: numOr(cfg?.chennai, DEFAULT_DELIVERY_CONFIG.chennai),
  otherDistrict: numOr(cfg?.otherDistrict, DEFAULT_DELIVERY_CONFIG.otherDistrict),
  otherState: numOr(cfg?.otherState, DEFAULT_DELIVERY_CONFIG.otherState),
});

/** Picks the matching key from a `{ status, data }` wrapper or a bare object. */
const unwrap = (res: DeliveryConfigResponse | ApiDeliveryConfig): ApiDeliveryConfig =>
  (res as DeliveryConfigResponse)?.data ?? (res as ApiDeliveryConfig);

export type DeliveryZone = 'chennai' | 'otherDistrict' | 'otherState';

/** Classifies a destination address into a delivery zone. */
export const resolveDeliveryZone = (address: { city?: string; state?: string }): DeliveryZone => {
  const city = (address.city || '').trim().toLowerCase();
  const state = (address.state || '').trim().toLowerCase();
  if (city === HOME_CITY) return 'chennai';
  if (state === HOME_STATE) return 'otherDistrict';
  return 'otherState';
};

/** Returns the delivery charge (₹) for a destination, given the active config. */
export const getDeliveryCharge = (
  config: DeliveryConfig,
  address: { city?: string; state?: string },
): number => config[resolveDeliveryZone(address)];

export const deliveryConfigService = {
  /** Public config used at checkout to display the delivery charge. */
  getDeliveryConfig: async (): Promise<DeliveryConfig> => {
    try {
      const res = await api.get<DeliveryConfigResponse | ApiDeliveryConfig>('/delivery-config');
      return parseConfig(unwrap(res));
    } catch {
      return DEFAULT_DELIVERY_CONFIG;
    }
  },

  /** Admin read of the editable config. */
  getAdminDeliveryConfig: async (): Promise<DeliveryConfig> => {
    const res = await api.get<DeliveryConfigResponse | ApiDeliveryConfig>('/admin/delivery-config');
    return parseConfig(unwrap(res));
  },

  /** Admin update (full replace) of the zone charges. */
  updateDeliveryConfig: async (payload: DeliveryConfig): Promise<DeliveryConfig> => {
    const res = await api.put<DeliveryConfigResponse | ApiDeliveryConfig>('/admin/delivery-config', payload);
    return parseConfig(unwrap(res));
  },
};
