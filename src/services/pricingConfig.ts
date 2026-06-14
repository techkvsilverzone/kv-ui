import { api } from '../lib/api';

export interface PricingConfig {
  /** GST percentage as a whole number, e.g. 3 means 3%. */
  gstPercent: number;
}

/** Fallback used before the config loads or if the request fails. */
export const DEFAULT_PRICING_CONFIG: PricingConfig = { gstPercent: 3 };

interface ApiPricingConfig {
  gstPercent?: number;
  gst?: number;
  taxPercent?: number;
  tax?: number;
}

interface PricingConfigResponse {
  status?: string;
  data?: ApiPricingConfig;
}

export const pricingConfigService = {
  getPricingConfig: async (): Promise<PricingConfig> => {
    try {
      // The endpoint returns `{ status, data: { gstPercent } }`; tolerate a bare object too.
      const res = await api.get<PricingConfigResponse | ApiPricingConfig>('/pricing-config');
      const cfg = (res as PricingConfigResponse)?.data ?? (res as ApiPricingConfig);
      const gst = cfg?.gstPercent ?? cfg?.gst ?? cfg?.taxPercent ?? cfg?.tax;
      return {
        gstPercent: typeof gst === 'number' && Number.isFinite(gst) ? gst : DEFAULT_PRICING_CONFIG.gstPercent,
      };
    } catch {
      return DEFAULT_PRICING_CONFIG;
    }
  },
};
