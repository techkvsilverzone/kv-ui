import { describe, it, expect } from 'vitest';
import {
  computeRateBlock,
  resolveRateBlock,
  isMetalStale,
  isSameLocalDay,
  isRateUpdateExemptDay,
  latestRateDate,
  RATE_UPDATE_CUTOFF_HOUR,
} from './rateFreshness';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);
// 2026-06-14 is a Sunday.
const sunday = (h = 0, min = 0) => at(2026, 6, 14, h, min);

describe('isSameLocalDay', () => {
  it('matches the same calendar day regardless of time', () => {
    expect(isSameLocalDay(at(2026, 6, 16, 0, 1), at(2026, 6, 16, 23, 59))).toBe(true);
  });
  it('rejects different days', () => {
    expect(isSameLocalDay(at(2026, 6, 16), at(2026, 6, 17))).toBe(false);
  });
});

describe('latestRateDate', () => {
  it('returns the most recent valid date', () => {
    const latest = latestRateDate([
      { date: '2026-06-14' },
      { date: '2026-06-16' },
      { date: '2026-06-15' },
    ]);
    expect(latest?.getDate()).toBe(16);
  });
  it('ignores missing/invalid dates and returns null when none', () => {
    expect(latestRateDate([{}, { date: 'not-a-date' }])).toBeNull();
    expect(latestRateDate([])).toBeNull();
  });
});

describe('isRateUpdateExemptDay', () => {
  it('is true on Sunday', () => {
    expect(isRateUpdateExemptDay(sunday(11))).toBe(true);
  });
  it('is false on other days', () => {
    expect(isRateUpdateExemptDay(at(2026, 6, 15, 11))).toBe(false);
  });
});

describe('isMetalStale', () => {
  const cutoff = RATE_UPDATE_CUTOFF_HOUR;

  it('is never stale before the cutoff, even with no rate', () => {
    expect(isMetalStale(null, at(2026, 6, 16, cutoff - 1))).toBe(false);
  });

  it('is stale after the cutoff when there is no rate', () => {
    expect(isMetalStale(null, at(2026, 6, 16, cutoff))).toBe(true);
  });

  it('is stale after the cutoff when the latest rate is from yesterday', () => {
    expect(isMetalStale(at(2026, 6, 15, 9), at(2026, 6, 16, cutoff + 1))).toBe(true);
  });

  it('is fresh after the cutoff when today already has a rate', () => {
    expect(isMetalStale(at(2026, 6, 16, 8), at(2026, 6, 16, cutoff + 1))).toBe(false);
  });

  it('is never stale on Sunday, even with no rate, past the cutoff', () => {
    expect(isMetalStale(null, sunday(cutoff + 1))).toBe(false);
  });
});

describe('computeRateBlock', () => {
  const afterCutoff = at(2026, 6, 16, RATE_UPDATE_CUTOFF_HOUR + 1);

  it('blocks and reports stale metals', () => {
    const result = computeRateBlock(
      {
        silver: { available: true, latestDate: at(2026, 6, 15) },
        gold: { available: true, latestDate: at(2026, 6, 16) },
      },
      afterCutoff,
    );
    expect(result.blocked).toBe(true);
    expect(result.staleMetals).toEqual(['silver']);
  });

  it('skips metals whose source is unavailable (e.g. gold endpoint not deployed)', () => {
    const result = computeRateBlock(
      {
        silver: { available: true, latestDate: at(2026, 6, 16) },
        gold: { available: false, latestDate: null },
      },
      afterCutoff,
    );
    expect(result.blocked).toBe(false);
    expect(result.staleMetals).toEqual([]);
  });

  it('does not block before the cutoff', () => {
    const result = computeRateBlock(
      { silver: { available: true, latestDate: at(2026, 6, 15) } },
      at(2026, 6, 16, RATE_UPDATE_CUTOFF_HOUR - 1),
    );
    expect(result.blocked).toBe(false);
  });

  it('does not block on Sunday even with a stale rate past the cutoff', () => {
    const result = computeRateBlock(
      { silver: { available: true, latestDate: at(2026, 6, 12) } },
      sunday(RATE_UPDATE_CUTOFF_HOUR + 1),
    );
    expect(result.blocked).toBe(false);
    expect(result.staleMetals).toEqual([]);
  });
});

describe('resolveRateBlock', () => {
  const now = at(2026, 6, 16, RATE_UPDATE_CUTOFF_HOUR + 1);

  it('honours the server flag even when the client clock would not block', () => {
    // Server (IST-correct) says silver is stale; client has no fresh silver rate.
    const result = resolveRateBlock(
      { blocked: true, staleMetals: ['silver'] },
      { silver: at(2026, 6, 15), gold: at(2026, 6, 16) },
      now,
    );
    expect(result.blocked).toBe(true);
    expect(result.staleMetals).toEqual(['silver']);
  });

  it('clears a server-stale metal the instant today’s rate is present (just saved)', () => {
    // Server still flags silver, but the client now has today's silver rate -> unblock.
    const result = resolveRateBlock(
      { blocked: true, staleMetals: ['silver'] },
      { silver: at(2026, 6, 16, 10, 30) },
      now,
    );
    expect(result.blocked).toBe(false);
    expect(result.staleMetals).toEqual([]);
  });

  it('keeps other stale metals blocked while one is cleared', () => {
    const result = resolveRateBlock(
      { blocked: true, staleMetals: ['silver', 'gold'] },
      { silver: at(2026, 6, 16), gold: at(2026, 6, 15) },
      now,
    );
    expect(result.staleMetals).toEqual(['gold']);
  });

  it('is not blocked when the server reports nothing stale', () => {
    const result = resolveRateBlock({ blocked: false, staleMetals: [] }, {}, now);
    expect(result.blocked).toBe(false);
  });

  it('ignores a stale server flag on Sunday', () => {
    const result = resolveRateBlock(
      { blocked: true, staleMetals: ['silver', 'gold'] },
      {},
      sunday(RATE_UPDATE_CUTOFF_HOUR + 1),
    );
    expect(result.blocked).toBe(false);
    expect(result.staleMetals).toEqual([]);
  });
});
