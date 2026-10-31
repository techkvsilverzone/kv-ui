import { describe, expect, it } from 'vitest';
import {
  resolveChargeAmount,
  matchSilverRate,
  computeProductPricing,
  computeOrderSummary,
  parseGrams,
  resolvePurityFraction,
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
    // Server formula: metal = 10 × 90 × 0.925 = 832.5; making = 12% = 99.9; wastage = 100 → 1032.4
    expect(result.computed).toBe(true);
    expect(result.metalValue).toBe(832.5);
    expect(result.makingCharge).toBe(99.9);
    expect(result.wastage).toBe(100);
    expect(result.preGstPrice).toBe(1032.4);
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
    expect(result.preGstPrice).toBe(1665); // 20 × 90 × 0.925, 0% making
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

// The same cases as kv-api src/tests/pricing.service.test.ts, so website and server can't drift.
describe('computeProductPricing matches the server (PricingService.computeUnitPrice)', () => {
  const at100 = [rate({ purity: '925', ratePerGram: 100 })];
  const base = { price: 650, isFixedPrice: false, weight: '', weightInGrams: 10, purity: '925' };

  it('live = weight × rate × purity + making %', () => {
    expect(computeProductPricing({ ...base, makingChargePercent: 10 }, at100).preGstPrice).toBe(1017.5);
  });
  it('making per gram', () => {
    expect(computeProductPricing({ ...base, makingChargePerGram: 50 }, at100).preGstPrice).toBe(1425);
  });
  it('no charge at all → listed price (Wooden Aarathi), even when the API price is the old live figure', () => {
    const r = computeProductPricing(
      { ...base, price: 965.03, listedPrice: 650, weightInGrams: 4.2, purity: '999', makingCharges: null,
        makingChargePercent: null, makingChargePerGram: null, pricing: { ratePerGram: 230, purityFraction: 0.999 } },
      [],
    );
    expect(r.computed).toBe(false);
    expect(r.preGstPrice).toBe(650);
  });
  it('an explicit 0 legacy charge prices live with the server rate and rounding', () => {
    const r = computeProductPricing(
      { ...base, weightInGrams: 4.2, purity: '999', makingCharges: 0, pricing: { ratePerGram: 230, purityFraction: 0.999 } },
      [],
    );
    expect(r.preGstPrice).toBe(965.03);
  });
  it("the server's rate wins over today's rates; fixed price ignores both", () => {
    expect(computeProductPricing({ ...base, makingChargePercent: 0, pricing: { ratePerGram: 200 } }, at100).preGstPrice).toBe(1850);
    expect(computeProductPricing({ ...base, isFixedPrice: true, makingChargePercent: 10 }, at100).preGstPrice).toBe(650);
  });
  it('purity defaults: silver 0.925, other materials 1', () => {
    expect(resolvePurityFraction(null, 'Silver')).toBe(0.925);
    expect(resolvePurityFraction('', 'Wood')).toBe(1);
    expect(resolvePurityFraction('92.5')).toBe(0.925);
  });
});
