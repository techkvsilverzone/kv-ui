import { describe, expect, it } from 'vitest';
import { productFormErrors, type ProductFormValues } from './productForm';

const ok: ProductFormValues = {
  name: 'Kamachi Vilakku', price: '', images: ['data:image/jpeg;base64,AA'], category: 'Puja Items', weight: '19.8',
  isFixedPrice: false, variants: [{ label: '3 Inch', weight: '19.8', height: '8.5', breadth: '4.5' }],
  makingChargeType: 'percentage', makingChargeValue: '5', wastageType: 'percentage', wastageValue: '2',
};

describe('productFormErrors', () => {
  it("passes the owner's video product (with a photo)", () => {
    expect(productFormErrors(ok)).toEqual({});
  });

  it('names every missing or wrong field', () => {
    const e = productFormErrors({
      ...ok, name: ' ', images: [], category: '', weight: 'abc', makingChargeValue: '-1',
      variants: [{ label: 'L', weight: '' }, { label: '', weight: '', height: '', breadth: '' }],
    });
    expect(e).toEqual({
      name: 'Enter the product name',
      images: 'Add at least one product photo',
      category: 'Choose a category',
      weight: 'Enter the weight in grams, e.g. 19.8',
      makingCharge: 'Making charge: Cannot be negative',
      variants: 'Size "L" needs a weight in grams, e.g. 20g',
    });
  });

  it('fixed-price products need a price, not a weight', () => {
    expect(productFormErrors({ ...ok, isFixedPrice: true, weight: '', price: '0' })).toEqual({
      price: 'Enter the selling price (more than ₹0)',
    });
  });

  it('flags photos too large to upload', () => {
    expect(productFormErrors({ ...ok, images: ['x'.repeat(15_000_000)] }).images).toMatch(/too large/);
  });
});
