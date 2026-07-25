import { api } from '../lib/api';
import { ApiError } from '../lib/api';
import type { Product } from '../context/CartContext';
import type { Order } from './order';
import type { User } from '../context/AuthContext';
import type { SavingsEnrollment, SavingsAdminUpdatePayload } from './savings';

export interface StoreConfig {
  theme: string;
  isDark: boolean;
  marqueeMessages?: string[];
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  changes?: {
    revenue?: string;
    orders?: string;
    products?: string;
    customers?: string;
  };
}

const normalizeOrder = (order: Order): Order => ({
  ...order,
  id: order.id || order._id,
});

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    return api.get<AdminStats>('/admin/stats');
  },

  getAllUsers: async (): Promise<User[]> => {
    const users = await api.get<User[]>('/admin/users');
    return users.map(u => ({ ...u, id: u.id || (u as any)._id || '' }));
  },

  getAllOrders: async (): Promise<Order[]> => {
    const orders = await api.get<Order[]>('/admin/orders');
    return orders.map(normalizeOrder);
  },

  getAllSavingsSchemes: async (): Promise<SavingsEnrollment[]> => {
    return api.get<SavingsEnrollment[]>('/admin/savings');
  },

  /** Admin-only passbook correction — staff cannot call this (backend enforces `admin`, not `adminOrStaff`). */
  updateSavingsScheme: async (id: string, payload: SavingsAdminUpdatePayload): Promise<SavingsEnrollment> => {
    return api.put<SavingsEnrollment>(`/admin/savings/${id}`, payload);
  },

  /** Admin-only passbook deletion — staff cannot call this. */
  deleteSavingsScheme: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/savings/${id}`);
  },

  /** Admin-only manual/offline collection entry (cash payment, correction, legacy migration).
   * `materialRate` optionally overrides the live silver rate. Staff cannot call this. */
  recordSavingsPayment: async (
    id: string,
    payload: { amount: number; materialRate?: number },
  ): Promise<SavingsEnrollment> => {
    return api.post<SavingsEnrollment>(`/admin/savings/${id}/pay`, payload);
  },

  /** Admin-only correction of a single ledger row. Staff cannot call this. */
  updateSavingsPaymentRow: async (
    id: string,
    index: number,
    patch: { amount?: number; materialRate?: number; devidentAmount?: number; devidentMaterialRate?: number; paidAt?: string },
  ): Promise<SavingsEnrollment> => {
    return api.put<SavingsEnrollment>(`/admin/savings/${id}/payments/${index}`, patch);
  },

  /** Admin-only removal of an erroneous ledger row. Staff cannot call this. */
  deleteSavingsPaymentRow: async (id: string, index: number): Promise<SavingsEnrollment> => {
    return api.delete<SavingsEnrollment>(`/admin/savings/${id}/payments/${index}`);
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    return api.post<Product>('/admin/products', productData);
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    return api.put<Product>(`/admin/products/${id}`, productData);
  },

  deleteProduct: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/products/${id}`);
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${id}/status`, { status });
  },

  deleteOrder: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/orders/${id}`);
  },

  deleteUser: async (id: string): Promise<void> => {
    return api.delete<void>(`/admin/users/${id}`);
  },

  updateUser: async (id: string, data: Partial<Pick<User, 'name' | 'phone' | 'city' | 'isAdmin'>>): Promise<User> => {
    return api.put<User>(`/admin/users/${id}`, data);
  },

  getStoreConfig: async (): Promise<StoreConfig> => {
    return api.get<StoreConfig>('/admin/store-config');
  },

  updateStoreConfig: async (config: StoreConfig): Promise<void> => {
    try {
      await api.put<void>('/admin/store-config', config);
    } catch (error) {
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 405)) {
        await api.post<void>('/admin/store-config', config);
        return;
      }
      throw error;
    }
  },

  /** Send a WhatsApp broadcast (festival promotions etc.) to all registered customers. */
  sendWhatsAppBroadcast: async (
    message: string,
  ): Promise<{ recipients: number; sent: number; failed: number }> => {
    const res = await api.post<{ status?: string; data?: { recipients: number; sent: number; failed: number } }>(
      '/admin/whatsapp/broadcast',
      { message },
    );
    return res.data ?? { recipients: 0, sent: 0, failed: 0 };
  },
};
