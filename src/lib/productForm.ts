import type { ChargeType, ProductVariant } from '@/context/CartContext';

/** Field name → what's wrong with it. Keys match the API's error `field` where they overlap. */
export type ProductFieldErrors = Partial<Record<string, string>>;

export interface ProductFormValues {
  name: string;
  price: string;
  images: string[];
  category: string;
  weight: string;
  isFixedPrice: boolean;
  variants: ProductVariant[];
  makingChargeType: ChargeType;
  makingChargeValue: string;
  wastageType: ChargeType;
  wastageValue: string;
}

/** Making-charge / wastage value check. Empty is allowed (the charge is optional). */
export const validateCharge = (type: ChargeType, value: string): string => {
  if (value.trim() === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return 'Enter a valid number';
  if (n < 0) return 'Cannot be negative';
  if (type === 'percentage' && n > 100) return 'Percentage cannot exceed 100';
  return '';
};

const grams = (w: string) => Number(String(w).replace(/[^\d.]/g, ''));

/** The API refuses bodies over 15 MB; stay under it with room for the other fields. */
const MAX_PHOTO_CHARS = 14_000_000;

/** Everything the product form must have before it is sent, phrased for the admin. */
export function productFormErrors(f: ProductFormValues): ProductFieldErrors {
  const e: ProductFieldErrors = {};
  if (!f.name.trim()) e.name = 'Enter the product name';
  if (f.images.length === 0) e.images = 'Add at least one product photo';
  else if (f.images.reduce((n, img) => n + img.length, 0) > MAX_PHOTO_CHARS)
    e.images = 'The photos are too large in total. Remove some or use smaller ones.';
  if (!f.category) e.category = 'Choose a category';
  if (f.isFixedPrice) {
    if (!(Number(f.price) > 0)) e.price = 'Enter the selling price (more than ₹0)';
  } else {
    if (!(grams(f.weight) > 0)) e.weight = 'Enter the weight in grams, e.g. 19.8';
    const making = validateCharge(f.makingChargeType, f.makingChargeValue);
    if (making) e.makingCharge = `Making charge: ${making}`;
    const wastage = validateCharge(f.wastageType, f.wastageValue);
    if (wastage) e.wastage = `Wastage: ${wastage}`;
  }
  const badSize = f.variants.findIndex(
    (v) => (v.label.trim() || v.weight.trim() || v.height?.trim() || v.breadth?.trim()) && !(grams(v.weight) > 0),
  );
  if (badSize >= 0) {
    const v = f.variants[badSize];
    e.variants = `Size ${v.label.trim() ? `"${v.label.trim()}"` : badSize + 1} needs a weight in grams, e.g. 20g`;
  }
  return e;
}
