import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminService } from './admin';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes order id from _id when reading all orders', async () => {
    vi.mocked(api.get).mockResolvedValue([{ _id: 'o1', status: 'Pending' }]);

    const orders = await adminService.getAllOrders();

    expect(api.get).toHaveBeenCalledWith('/admin/orders');
    expect(orders[0].id).toBe('o1');
  });

  it('posts, puts and deletes products in admin endpoints', async () => {
    const productPayload = {
      name: 'P',
      price: 100,
      image: '',
      category: 'Rings',
      weight: '1g',
      purity: '925',
      description: 'd',
      inStock: true,
    };

    vi.mocked(api.post).mockResolvedValue({ id: 'p1', ...productPayload });
    vi.mocked(api.put).mockResolvedValue({ id: 'p1', ...productPayload, price: 150 });
    vi.mocked(api.delete).mockResolvedValue(undefined);

    await adminService.createProduct(productPayload as never);
    await adminService.updateProduct('p1', { price: 150 });
    await adminService.deleteProduct('p1');

    expect(api.post).toHaveBeenCalledWith('/admin/products', productPayload);
    expect(api.put).toHaveBeenCalledWith('/admin/products/p1', { price: 150 });
    expect(api.delete).toHaveBeenCalledWith('/admin/products/p1');
  });

  it('updates order status at admin endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ id: 'o1', status: 'Shipped' });

    await adminService.updateOrderStatus('o1', 'Shipped');

    expect(api.put).toHaveBeenCalledWith('/admin/orders/o1/status', { status: 'Shipped' });
  });

  it('updates and deletes a savings/passbook record at the admin-only endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ _id: 's1', status: 'Cancelled' });
    vi.mocked(api.delete).mockResolvedValue(undefined);

    await adminService.updateSavingsScheme('s1', { status: 'Cancelled' });
    await adminService.deleteSavingsScheme('s1');

    expect(api.put).toHaveBeenCalledWith('/admin/savings/s1', { status: 'Cancelled' });
    expect(api.delete).toHaveBeenCalledWith('/admin/savings/s1');
  });

  it('records a manual collection and edits/deletes a ledger row at the admin-only endpoints', async () => {
    vi.mocked(api.post).mockResolvedValue({ _id: 's1', totalPaid: 2000 });
    vi.mocked(api.put).mockResolvedValue({ _id: 's1' });
    vi.mocked(api.delete).mockResolvedValue({ _id: 's1' });

    await adminService.recordSavingsPayment('s1', { amount: 2000, materialRate: 100 });
    await adminService.updateSavingsPaymentRow('s1', 0, { amount: 2500 });
    await adminService.deleteSavingsPaymentRow('s1', 0);

    expect(api.post).toHaveBeenCalledWith('/admin/savings/s1/pay', { amount: 2000, materialRate: 100 });
    expect(api.put).toHaveBeenCalledWith('/admin/savings/s1/payments/0', { amount: 2500 });
    expect(api.delete).toHaveBeenCalledWith('/admin/savings/s1/payments/0');
  });
});
