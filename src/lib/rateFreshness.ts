/**
 * Daily metal-rate freshness rules.
 *
 * Business rule: the silver/gold rate is a *mandatory daily update*. Every morning by
 * 10:00 (store-local time) the admin must record today's rate. If the rate is still
 * yesterday's (or older) at/after that cutoff, the admin panel is blocked for
 * admin/staff until they update it. Customers are never affected (they cannot reach
 * the admin panel). Sunday is exempt — the store does not require a rate update that
 * day, so the lock never engages regardless of the cutoff hour or rate age. The
 * matching server-side 10am cron + WhatsApp alert is specified in
 * docs/25-price-update-guard-and-notification.md.
 */

export type Metal = 'silver' | 'gold';

/** Hour-of-day (store-local) by which the rate must be updated. */
export const RATE_UPDATE_CUTOFF_HOUR = 10;

export interface MetalRateInfo {
  /**
   * Whether this metal's data source is available. When the gold endpoint is not yet
   * deployed (request errored / never fetched), pass `false` so the metal is skipped
   * instead of being wrongly treated as stale.
   */
  available: boolean;
  /** Latest known rate record date for this metal, or null if none exists. */
  latestDate: Date | null;
}

export interface RateBlockResult {
  blocked: boolean;
  staleMetals: Metal[];
}

/** True when `a` and `b` fall on the same calendar day in local time. */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** `Date#getDay()` value for Sunday. */
const SUNDAY = 0;

/** True when `now` falls on a day exempt from the mandatory rate update (Sunday). */
export function isRateUpdateExemptDay(now: Date): boolean {
  return now.getDay() === SUNDAY;
}

/** Most recent valid `date` across a list of rate records, or null when there are none. */
export function latestRateDate(rates: Array<{ date?: string }>): Date | null {
  let latest: Date | null = null;
  for (const r of rates) {
    if (!r.date) continue;
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    if (!latest || d > latest) latest = d;
  }
  return latest;
}

/**
 * A metal is stale when, at/after the cutoff hour, its latest rate is not from today.
 * Before the cutoff there is still time to update, so it is never stale yet. Sunday is
 * exempt entirely — no update is required, so it is never stale that day.
 */
export function isMetalStale(
  latest: Date | null,
  now: Date,
  cutoffHour = RATE_UPDATE_CUTOFF_HOUR,
): boolean {
  if (isRateUpdateExemptDay(now)) return false;
  if (now.getHours() < cutoffHour) return false;
  if (!latest) return true;
  return !isSameLocalDay(latest, now);
}

/**
 * Decide whether the admin panel should be blocked. Only metals whose source is
 * `available` are evaluated, so an undeployed gold endpoint can never cause a block.
 */
export function computeRateBlock(
  metals: Partial<Record<Metal, MetalRateInfo>>,
  now: Date,
  cutoffHour = RATE_UPDATE_CUTOFF_HOUR,
): RateBlockResult {
  const staleMetals: Metal[] = [];
  (Object.keys(metals) as Metal[]).forEach((metal) => {
    const info = metals[metal];
    if (!info || !info.available) return;
    if (isMetalStale(info.latestDate, now, cutoffHour)) staleMetals.push(metal);
  });
  return { blocked: staleMetals.length > 0, staleMetals };
}

/** The server's authoritative block flag (`GET /admin/rate-status`). */
export interface ServerRateStatus {
  blocked: boolean;
  staleMetals: Metal[];
}

/**
 * Reconcile the server's authoritative flag with the client's freshest rate data.
 *
 * The server (IST-correct 10:00 cron) decides *when* a metal becomes stale — so it can
 * engage the lock even if the admin's browser clock disagrees. But the persisted flag is
 * only recomputed by the cron, so after an admin saves today's rate we must clear the lock
 * immediately rather than wait for the next run: a metal the server marks stale is dropped
 * the moment the client's latest rate record for it is dated today.
 *
 * Sunday is exempt regardless of the server flag — this guards against a stale flag left
 * over from Saturday's cutoff (or a server not yet updated with the Sunday exemption).
 */
export function resolveRateBlock(
  server: ServerRateStatus,
  latestByMetal: Partial<Record<Metal, Date | null>>,
  now: Date,
): RateBlockResult {
  if (isRateUpdateExemptDay(now)) return { blocked: false, staleMetals: [] };
  const staleMetals = server.staleMetals.filter((metal) => {
    const latest = latestByMetal[metal] ?? null;
    // Keep blocked unless today's rate is already present (just saved).
    return !(latest && isSameLocalDay(latest, now));
  });
  return { blocked: staleMetals.length > 0, staleMetals };
}
