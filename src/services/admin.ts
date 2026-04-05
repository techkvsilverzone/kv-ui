import { api } from '../lib/api';
import type { Product } from '../context/CartContext';
import type { Order } from './order';
import type { User } from '../context/AuthContext';
import type { SavingsEnrollment } from './savings';

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

  updateStoreConfig: async (config: { theme: string; isDark: boolean }): Promise<void> => {
    return api.put<void>('/admin/store-config', config);
  },
};
