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
    return api.get<User[]>('/admin/users');
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
};
