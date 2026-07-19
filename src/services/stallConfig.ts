import { api } from '../lib/api';

/** Offline-stall registration mode: when active, /signup?stall=1 shows the stall
 * banner and new signups are auto-credited a one-time promo coupon (server-side). */
export interface StallConfig {
  active: boolean;
}

export const DEFAULT_STALL_CONFIG: StallConfig = { active: false };

interface ApiStallConfig {
  active?: boolean;
}

interface StallConfigResponse {
  status?: string;
  data?: ApiStallConfig;
}

const parseConfig = (cfg?: ApiStallConfig): StallConfig => ({
  active: typeof cfg?.active === 'boolean' ? cfg.active : DEFAULT_STALL_CONFIG.active,
});

const unwrap = (res: StallConfigResponse | ApiStallConfig): ApiStallConfig =>
  (res as StallConfigResponse)?.data ?? (res as ApiStallConfig);

export const stallConfigService = {
  /** Public read — used by the Signup page to decide whether to show the stall banner. */
  getStallConfig: async (): Promise<StallConfig> => {
    try {
      const res = await api.get<StallConfigResponse | ApiStallConfig>('/stall-config');
      return parseConfig(unwrap(res));
    } catch {
      return DEFAULT_STALL_CONFIG;
    }
  },

  /** Admin read of the editable config. */
  getAdminStallConfig: async (): Promise<StallConfig> => {
    const res = await api.get<StallConfigResponse | ApiStallConfig>('/admin/stall-config');
    return parseConfig(unwrap(res));
  },

  /** Admin update (enable/disable). */
  updateStallConfig: async (payload: StallConfig): Promise<StallConfig> => {
    const res = await api.put<StallConfigResponse | ApiStallConfig>('/admin/stall-config', payload);
    return parseConfig(unwrap(res));
  },
};
