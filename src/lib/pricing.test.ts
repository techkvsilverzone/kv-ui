import { describe, expect, it } from 'vitest';
import {
  resolveChargeAmount,
  matchSilverRate,
  computeProductPricing,
  computeOrderSummary,
  parseGrams,
} from './pricing';
import type { SilverRate } from '../services/silverRate';

const rate = (over: Partial<SilverRate>): SilverRate => ({
  id: '1',
  date: '2026-06-16',
  ratePerGram: 90,
  ratePerKg: 90000,
  purity: '925',
  ...over,
});

describe('parseGrams', () => {
  it('extracts the numeric grams from a free-text weight', () => {
    expect(parseGrams('10.5 g')).toBe(10.5);
    expect(parseGrams('20g')).toBe(20);
  });

  it('returns null for missing or non-positive weights', () => {
    expect(parseGrams(undefined)).toBeNull();
    expect(parseGrams('abc')).toBeNull();
    expect(parseGrams('0 g')).toBeNull();
  });
});

describe('matchSilverRate', () => {
  it('matches the rate whose purity equals the product purity', () => {
    const rates = [rate({ purity: '999', ratePerGram: 100 }), rate({ purity: '925', ratePerGram: 90 })];
    expect(matchSilverRate(rates, '925')?.ratePerGram).toBe(90);
    expect(matchSilverRate(rates, '92.5%')?.ratePerGram).toBe(90);
  });

  it('falls back to the first rate when purity does not match', () => {
    const rates = [rate({ purity: '999', ratePerGram: 100 })];
    expect(matchSilverRate(rates, '800')?.ratePerGram).toBe(100);
  });

  it('returns undefined when there are no rates', () => {
    expect(matchSilverRate([], '925')).toBeUndefined();
  });
});

describe('resolveChargeAmount', () => {
  it('computes a percentage of the base', () => {
    expect(resolveChargeAmount({ type: 'percentage', value: 12 }, 1000)).toBe(120);
  });

  it('returns a flat amount as-is', () => {
    expect(resolveChargeAmount({ type: 'amount', value: 250 }, 1000)).toBe(250);
  });

  it('treats missing / invalid charges as zero', () => {
    expect(resolveChargeAmount(undefined, 1000)).toBe(0);
    expect(resolveChargeAmount({ type: 'amount', value: -5 }, 1000)).toBe(0);
  });
});

describe('computeProductPricing', () => {
  const rates = [rate({ purity: '925', ratePerGram: 90 })];

  it('computes metal value + making + wastage for a dynamic product', () => {
    const result = computeProductPricing(
      {
        price: 0,
        isFixedPrice: false,
        weight: '10 g',
        weightInGrams: 10,
        purity: '925',
        makingCharge: { type: 'percentage', value: 12 },
        wastage: { type: 'amount', value: 100 },
      },
      rates,
    );
    // metal = 10 × 90 = 900; making = 12% of 900 = 108; wastage = 100 → 1108
    expect(result.computed).toBe(true);
    expect(result.metalValue).toBe(900);
    expect(result.makingCharge).toBe(108);
    expect(result.wastage).toBe(100);
    expect(result.preGstPrice).toBe(1108);
  });

  it('uses a gram override (selected variant weight) over the product weight', () => {
    const result = computeProductPricing(
      {
        price: 0,
        isFixedPrice: false,
        weight: '10 g',
        weightInGrams: 10,
        purity: '925',
        makingCharge: { type: 'percentage', value: 0 },
      },
      rates,
      20,
    );
    expect(result.grams).toBe(20);
    expect(result.preGstPrice).toBe(1800); // 20 × 90, 0% making
  });

  it('keeps the listed price for a legacy product with rate + weight but no charges configured', () => {
    // Mirrors the backend guard: bare metal value is below cost, so such products are not "live".
    const result = computeProductPricing(
      { price: 2500, isFixedPrice: false, weight: '10 g', weightInGrams: 10, purity: '925' },
      rates,
    );
    expect(result.computed).toBe(false);
    expect(result.preGstPrice).toBe(2500);
  });

  it('returns the flat price for a fixed-price product (no metal calc)', () => {
    const result = computeProductPricing(
      { price: 4999, isFixedPrice: true, weight: '10 g', weightInGrams: 10, purity: '925' },
      rates,
    );
    expect(result.isFixedPrice).toBe(true);
    expect(result.computed).toBe(false);
    expect(result.preGstPrice).toBe(4999);
  });

  it('falls back to product.price when there is no rate or weight', () => {
    expect(
      computeProductPricing({ price: 1500, isFixedPrice: false, weight: '', purity: '925' }, rates).preGstPrice,
    ).toBe(1500);
    expect(
      computeProductPricing({ price: 1500, isFixedPrice: false, weight: '10 g', purity: '925' }, []).computed,
    ).toBe(false);
  });
});

describe('computeOrderSummary', () => {
  it('applies discount first, then GST on the discounted subtotal, then delivery', () => {
    const s = computeOrderSummary({
      subtotal: 1000,
      discount: 100,
      gstPercent: 3,
      deliveryCharge: 150,
    });
    // discounted = 900; gst = 3% of 900 = 27; total = 900 + 27 + 150 = 1077
    expect(s.discountedSubtotal).toBe(900);
    expect(s.gst).toBe(27);
    expect(s.deliveryCharge).toBe(150);
    expect(s.total).toBe(1077);
  });

  it('taxes only the taxable subtotal (gift vouchers excluded)', () => {
    const s = computeOrderSummary({
      subtotal: 1000,
      taxableSubtotal: 600,
      gstPercent: 3,
    });
    expect(s.gst).toBe(18); // 3% of 600
    expect(s.total).toBe(1018);
  });

  it('clamps the discount to the subtotal', () => {
    const s = computeOrderSummary({ subtotal: 500, discount: 999, gstPercent: 3 });
    expect(s.discount).toBe(500);
    expect(s.discountedSubtotal).toBe(0);
    expect(s.gst).toBe(0);
    expect(s.total).toBe(0);
  });

  it('defaults discount and delivery to zero', () => {
    const s = computeOrderSummary({ subtotal: 1000, gstPercent: 3 });
    expect(s.total).toBe(1030);
  });
});
