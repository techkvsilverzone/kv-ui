import { api } from '../lib/api';

export interface StoreConfig {
  theme: string;
  isDark: boolean;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  theme: 'ocean-teal',
  isDark: false,
};

export const storeConfigService = {
  getPublicStoreConfig: async (): Promise<StoreConfig> => {
    return api.get<StoreConfig>('/store-config');
  },
};
