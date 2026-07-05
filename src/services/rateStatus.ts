import { api } from '../lib/api';
import type { Metal } from '../lib/rateFreshness';

/**
 * Authoritative daily rate-update block flag, persisted server-side by the 10:00 IST cron
 * (see docs/25-price-update-guard-and-notification.md, B4). This is the source of truth for
 * the admin-panel lock — `Admin.tsx` prefers it over the client-side freshness rule, which
 * stays as an offline fallback (the client clock is not guaranteed to be IST).
 *
 * Admin-only endpoint (`GET /admin/rate-status`); staff fall back to the client-side rule.
 */
export interface RateStatus {
  blocked: boolean;
  staleMetals: Metal[];
  /** ISO timestamp of the last server-side freshness check. */
  checkedAt: string;
}

interface ApiRateStatus {
  blocked?: boolean;
  staleMetals?: string[];
  checkedAt?: string;
}

interface RateStatusResponse {
  status?: string;
  data?: ApiRateStatus;
}

const VALID_METALS: Metal[] = ['silver', 'gold'];

export const rateStatusService = {
  /** Reads the authoritative block flag. Throws on non-2xx so callers can fall back. */
  getRateStatus: async (): Promise<RateStatus> => {
    // Tolerate a `{ status, data }` wrapper or a bare object.
    const res = await api.get<RateStatusResponse | ApiRateStatus>('/admin/rate-status');
    const cfg = (res as RateStatusResponse)?.data ?? (res as ApiRateStatus);
    const staleMetals = Array.isArray(cfg?.staleMetals)
      ? cfg!.staleMetals!.filter((m): m is Metal => (VALID_METALS as string[]).includes(m))
      : [];
    return {
      blocked: !!cfg?.blocked,
      staleMetals,
      checkedAt: typeof cfg?.checkedAt === 'string' ? cfg.checkedAt : '',
    };
  },
};
