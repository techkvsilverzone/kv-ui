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
export const resolveChargeAmount = (charge: ProductCharge | undefined, base: number): number => {
  if (!charge || !Number.isFinite(charge.value) || charge.value < 0) return 0;
  return charge.type === 'amount' ? charge.value : (base * charge.value) / 100;
};

export interface ProductPriceBreakdown {
  /** Whether the product is sold at a flat price (no dynamic metal-rate calc). */
  isFixedPrice: boolean;
  /** True when `preGstPrice` was derived from a live silver-rate calc (vs a fallback to `product.price`). */
  computed: boolean;
  /** Silver rate per gram used for the calc (dynamic + computed only). */
  ratePerGram: number | null;
  /** Weight in grams used for the calc (dynamic + computed only). */
  grams: number | null;
  /** Metal value = `ratePerGram × grams` (dynamic + computed only). */
  metalValue: number | null;
  /** Resolved making charge in ₹ (dynamic + computed only). */
  makingCharge: number | null;
  /** Resolved wastage in ₹ (dynamic + computed only). */
  wastage: number | null;
  /** Pre-GST price shown in Collections / Product Detail. */
  preGstPrice: number;
}

type PricingInput = Pick<
  Product,
  'price' | 'isFixedPrice' | 'weight' | 'weightInGrams' | 'purity' | 'makingCharge' | 'wastage'
>;

/**
 * Computes a product's pre-GST display price.
 *   Dynamic: metalValue (rate × grams) + making charge + wastage.
 *   Fixed-price: the flat `product.price`.
 * Falls back to `product.price` when a dynamic product lacks a usable rate or weight.
 *
 * @param gramsOverride weight to use instead of the product's own (e.g. a selected size variant).
 */
export const computeProductPricing = (
  product: PricingInput,
  rates: SilverRate[] = [],
  gramsOverride?: number | null,
): ProductPriceBreakdown => {
  const fallback: ProductPriceBreakdown = {
    isFixedPrice: !!product.isFixedPrice,
    computed: false,
    ratePerGram: null,
    grams: null,
    metalValue: null,
    makingCharge: null,
    wastage: null,
    preGstPrice: product.price ?? 0,
  };

  if (product.isFixedPrice) return fallback;

  // Mirror the backend guard: only go "live" on rate × weight when the product is genuinely a
  // dynamically-priced item — i.e. it has a making charge or wastage configured. Legacy products
  // with neither keep their listed price (bare metal value would be below cost). This keeps the
  // displayed price in lockstep with the server-charged amount. See docs/24-product-price-calculation.md.
  const hasConfiguredCharge = !!product.makingCharge || !!product.wastage;
  const grams = gramsOverride ?? product.weightInGrams ?? parseGrams(product.weight) ?? null;
  const ratePerGram = matchSilverRate(rates, product.purity)?.ratePerGram ?? null;
  if (!grams || !ratePerGram || !hasConfiguredCharge) return fallback;

  const metalValue = grams * ratePerGram;
  const makingCharge = resolveChargeAmount(product.makingCharge, metalValue);
  const wastage = resolveChargeAmount(product.wastage, metalValue);

  return {
    isFixedPrice: false,
    computed: true,
    ratePerGram,
    grams,
    metalValue,
    makingCharge,
    wastage,
    preGstPrice: metalValue + makingCharge + wastage,
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
