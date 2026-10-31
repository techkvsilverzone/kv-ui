import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({ api: {} }));
import { normalizeOrder } from './order';

describe('normalizeOrder', () => {
  it('maps the PostgreSQL API shape onto the fields the screens read', () => {
    const order = normalizeOrder({
      _id: '77',
      invoiceNumber: 'INV-2026-000042',
      channel: 'OFFLINE',
      items: [{ _id: '1', productId: '5', productName: 'Silver Ring', unitPrice: 1000, totalPrice: 2000, quantity: 2 }],
      shippingAddress: { name: 'Walk-in customer', phone: '', line1: '12 Mount Road', line2: 'Near park', city: '', state: '', pincode: '' },
    });

    expect(order.id).toBe('77');
    expect(order.channel).toBe('OFFLINE');
    expect(order.items[0]).toMatchObject({ product: '5', name: 'Silver Ring', price: 1000, quantity: 2 });
    expect(order.shippingAddress).toMatchObject({ firstName: 'Walk-in customer', address: '12 Mount Road, Near park' });
  });

  it('leaves the older shape untouched and defaults the channel to ONLINE', () => {
    const order = normalizeOrder({
      _id: '9',
      items: [{ product: '5', name: 'Anklet', price: 500, quantity: 1, image: 'a.jpg' }],
      shippingAddress: { firstName: 'Asha', lastName: 'R', address: '1 Main St', city: 'Chennai', state: 'TN', pincode: '600001', phone: '9876543210' },
    });

    expect(order.channel).toBe('ONLINE');
    expect(order.items[0]).toMatchObject({ name: 'Anklet', price: 500, image: 'a.jpg' });
    expect(order.shippingAddress).toMatchObject({ firstName: 'Asha', lastName: 'R', address: '1 Main St', city: 'Chennai' });
  });

  it('maps the server-priced totals, falling back to the item sum for older orders', () => {
    const order = normalizeOrder({
      _id: '10',
      items: [{ productName: 'Chain', unitPrice: '1000', quantity: 2 }],
      subtotal: '2000', couponDiscount: '200', taxAmount: '54', deliveryFee: '150',
      giftWrap: true, giftMessage: 'Happy birthday', giftWrapFee: '99', totalAmount: '2103',
    });
    expect(order).toMatchObject({
      subtotal: 2000, couponDiscount: 200, taxAmount: 54, tax: 54, deliveryFee: 150,
      giftWrap: true, giftMessage: 'Happy birthday', giftWrapFee: 99, totalAmount: 2103,
    });

    const legacy = normalizeOrder({ _id: '11', items: [{ name: 'Ring', price: 500, quantity: 3 }], tax: 45, totalAmount: 1545 });
    expect(legacy).toMatchObject({ subtotal: 1500, taxAmount: 45, deliveryFee: 0, giftWrapFee: 0, giftWrap: false });
  });
});
