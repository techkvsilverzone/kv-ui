import { api } from '../lib/api';

export interface StoreConfig {
  theme: string;
  isDark: boolean;
  marqueeMessages?: string[];
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  theme: 'ocean-teal',
  isDark: false,
  marqueeMessages: [],
};

export const storeConfigService = {
  getPublicStoreConfig: async (): Promise<StoreConfig> => {
    return api.get<StoreConfig>('/store-config');
  },
};
