import type { Product, ProductCharge } from '../context/CartContext';
import type { SilverRate } from '../services/silverRate';

/**
 * Shared product price engine.
 *
 * Pricing model (per business spec):
 *   Product Price (metal value)      = today's silver rate/g × weight in grams
 *   Pre-GST price (shown in Shop)    = metal value + making charge + wastage
 *   At checkout:                       discount first → GST % on the discounted
 *                                       (taxable) subtotal → delivery added last
 *
 * Fixed-price products skip the metal-value calc entirely (their flat `price` is the
 * pre-GST price); discount, GST and delivery still apply to them.
 *
 * Display only — the server re-prices authoritatively at `/payments/create-order`.
 */

/** Extracts the numeric gram value from a free-text weight string (e.g. "10.5 g" -> 10.5). */
export const parseGrams = (weight?: string): number | null => {
  const match = weight?.match(/[\d.]+/);
  const grams = match ? parseFloat(match[0]) : NaN;
  return Number.isFinite(grams) && grams > 0 ? grams : null;
};

/** Converts a purity label to a 0-1 fraction. Handles per-1000 (925, 999) and percent (92.5%) forms. */
export const parsePurityFraction = (purity?: string): number | null => {
  const match = purity?.match(/[\d.]+/);
  const n = match ? parseFloat(match[0]) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n > 100 ? n / 1000 : n / 100;
};

/** Picks the silver rate whose purity matches the product, falling back to the first rate. */
export const matchSilverRate = (rates: SilverRate[], purity?: string): SilverRate | undefined => {
  if (!rates.length) return undefined;
  const frac = parsePurityFraction(purity);
  return (
    rates.find((r) => {
      const rf = parsePurityFraction(r.purity);
      return frac != null && rf != null && Math.abs(rf - frac) < 0.01;
    }) ?? rates[0]
  );
};

/** Resolves a making-charge / wastage config into a ₹ amount against the given metal-value base. */
/** Server `resolveChargeAmount`: a percentage of the metal value, or flat rupees. */
export const resolveChargeAmount = (charge: ProductCharge | undefined, base: number): number => {
  if (!charge || !Number.isFinite(charge.value) || charge.value <= 0) return 0;
  return charge.type === 'amount' ? charge.value : (base * charge.value) / 100;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Server `resolvePurityFraction`: "925" → 0.925, "92.5" → 0.925, "999" → 0.999;
 * absent → 0.925 for silver materials, else 1.
 */
export const resolvePurityFraction = (purity?: string | null, material?: string | null): number => {
  // Karat notation ("22K") is out of 24.
  const karat = String(purity ?? '').match(/(\d{1,2}(?:\.\d+)?)\s*k(?:t|arat)?\b/i);
  if (karat && Number(karat[1]) > 0 && Number(karat[1]) <= 24) return Number(karat[1]) / 24;
  const digits = String(purity ?? '').match(/[\d.]+/);
  if (digits) {
    const value = Number(digits[0]);
    if (Number.isFinite(value) && value > 0) {
      const fraction = value > 1 ? (value >= 100 ? value / 1000 : value / 100) : value;
      return Math.min(Math.max(fraction, 0), 1);
    }
  }
  return /silver/i.test(String(material ?? '')) ? 0.925 : 1;
};

export interface ProductPriceBreakdown {
  /** Whether the product is sold at a flat price (no dynamic metal-rate calc). */
  isFixedPrice: boolean;
  /** True when priced live from the metal rate (the server's "live" basis). */
  computed: boolean;
  ratePerGram: number | null;
  grams: number | null;
  /** Metal value = grams × rate × purity (live only). */
  metalValue: number | null;
  /** Resolved making charge in ₹ (live only). */
  makingCharge: number | null;
  /** Resolved wastage in ₹ (live only). */
  wastage: number | null;
  /** Pre-GST price shown in Collections / Product Detail — what checkout charges. */
  preGstPrice: number;
}

type PricingInput = Pick<
  Product,
  | 'price'
  | 'listedPrice'
  | 'isFixedPrice'
  | 'weight'
  | 'weightInGrams'
  | 'purity'
  | 'material'
  | 'makingCharge'
  | 'wastage'
  | 'makingCharges'
  | 'makingChargePercent'
  | 'makingChargePerGram'
  | 'pricing'
>;

/**
 * A port of kv-api `PricingService.computeUnitPrice`, so the price shown is the price
 * charged. Fixed-price → listed price. Otherwise live only when a rate, a weight and a
 * charge input exist (new `{type,value}` charge or a non-null legacy field):
 * weight × rate × purity + making + wastage. Anything else → the listed price.
 * The rate and purity come from the product's own `pricing` (what the server used);
 * `rates` (today's rates) is only a fallback when the product carries none.
 *
 * @param gramsOverride weight to use instead of the product's own (e.g. a selected size variant).
 */
export const computeProductPricing = (
  product: PricingInput,
  rates: SilverRate[] = [],
  gramsOverride?: number | null,
): ProductPriceBreakdown => {
  const listed = round2(product.listedPrice ?? product.price ?? 0);
  const fallback: ProductPriceBreakdown = {
    isFixedPrice: !!product.isFixedPrice,
    computed: false,
    ratePerGram: null,
    grams: null,
    metalValue: null,
    makingCharge: null,
    wastage: null,
    preGstPrice: listed,
  };
  if (product.isFixedPrice) return fallback;

  const grams =
    (gramsOverride && gramsOverride > 0 ? gramsOverride : null) ??
    product.weightInGrams ??
    parseGrams(product.weight) ??
    0;
  const ratePerGram = product.pricing?.ratePerGram ?? matchSilverRate(rates, product.purity)?.ratePerGram ?? null;
  const hasNewCharge = !!product.makingCharge || !!product.wastage;
  const hasLegacy =
    product.makingChargePerGram != null || product.makingChargePercent != null || product.makingCharges != null;
  if (!ratePerGram || ratePerGram <= 0 || grams <= 0 || !(hasNewCharge || hasLegacy)) return fallback;

  const purity = product.pricing?.purityFraction ?? resolvePurityFraction(product.purity, product.material);
  const metalValue = grams * ratePerGram * purity;
  let making = 0;
  if (product.makingCharge) making = resolveChargeAmount(product.makingCharge, metalValue);
  else if (product.makingChargePerGram != null) making = product.makingChargePerGram * grams;
  else if (product.makingChargePercent != null) making = metalValue * (product.makingChargePercent / 100);
  else making = product.makingCharges ?? 0;
  const wastage = resolveChargeAmount(product.wastage, metalValue);

  return {
    isFixedPrice: false,
    computed: true,
    ratePerGram,
    grams,
    metalValue: round2(metalValue),
    makingCharge: round2(making),
    wastage: round2(wastage),
    preGstPrice: round2(metalValue + making + wastage),
  };
};

export interface OrderSummaryInput {
  /** Pre-GST subtotal of all line items. */
  subtotal: number;
  /** Pre-GST subtotal of GST-taxable items only (excludes tax-inclusive gift vouchers). Defaults to `subtotal`. */
  taxableSubtotal?: number;
  /** Coupon / discount amount in ₹ (applied before GST). */
  discount?: number;
  /** GST percentage as a whole number, e.g. 3 means 3%. */
  gstPercent: number;
  /** Delivery charge in ₹ (added after GST). */
  deliveryCharge?: number;
}

export interface OrderSummary {
  subtotal: number;
  /** Discount actually applied (clamped to `[0, subtotal]`). */
  discount: number;
  /** Subtotal after discount (all items). */
  discountedSubtotal: number;
  /** GST computed on the taxable amount after discount. */
  gst: number;
  deliveryCharge: number;
  /** Final amount to pay: discountedSubtotal + gst + delivery. */
  total: number;
}

/**
 * Order math in the required order: discount first, then GST on the discounted
 * (taxable) subtotal, then delivery added last.
 *
 * Display only — the server stays authoritative for the charged amount at checkout.
 */
/** Flat gift-wrap fee the server adds after GST — display estimate only; checkout shows the server's figure. */
export const GIFT_WRAP_FEE = 99;

export const computeOrderSummary = ({
  subtotal,
  taxableSubtotal,
  discount = 0,
  gstPercent,
  deliveryCharge = 0,
}: OrderSummaryInput): OrderSummary => {
  const taxable = taxableSubtotal ?? subtotal;
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const discountedSubtotal = Math.max(subtotal - safeDiscount, 0);
  const taxableAfterDiscount = Math.max(taxable - safeDiscount, 0);
  const gst = (taxableAfterDiscount * gstPercent) / 100;

  return {
    subtotal,
    discount: safeDiscount,
    discountedSubtotal,
    gst,
    deliveryCharge,
    total: discountedSubtotal + gst + deliveryCharge,
  };
};
