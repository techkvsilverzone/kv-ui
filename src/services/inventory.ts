import { api } from '../lib/api';

export interface InventoryTransaction {
  id: string;
  type: 'IN' | 'OUT' | 'RECONCILE';
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  date: string;
  performedBy?: string;
}

export interface StockInwardPayload {
  productId: string;
  quantity: number;
  reason: string;
}

export interface StockOutwardPayload {
  productId: string;
  quantity: number;
  reason: string;
}

export interface ReconcilePayload {
  productId: string;
  physicalCount: number;
  reason?: string;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

export interface InventorySummary {
  totalItemsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: number;
}

export interface TransactionFilters {
  productId?: string;
  type?: 'IN' | 'OUT';
  limit?: number;
}

export const inventoryService = {
  getTransactions: async (filters?: TransactionFilters): Promise<InventoryTransaction[]> => {
    const params = new URLSearchParams();
    if (filters?.productId) params.set('productId', filters.productId);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.limit) params.set('limit', String(filters.limit));
    const query = params.toString();
    const res = await api.get<{ success: boolean; transactions: InventoryTransaction[] }>(
      `/admin/inventory/transactions${query ? `?${query}` : ''}`
    );
    return res.transactions ?? [];
  },

  recordInward: async (payload: StockInwardPayload): Promise<InventoryTransaction> => {
    const res = await api.post<{ success: boolean; transaction: InventoryTransaction }>(
      '/admin/inventory/inward',
      payload
    );
    return res.transaction;
  },

  recordOutward: async (payload: StockOutwardPayload): Promise<InventoryTransaction> => {
    const res = await api.post<{ success: boolean; transaction: InventoryTransaction }>(
      '/admin/inventory/outward',
      payload
    );
    return res.transaction;
  },

  reconcile: async (payload: ReconcilePayload): Promise<void> => {
    await api.post<unknown>('/admin/inventory/reconcile', payload);
  },

  getLowStock: async (): Promise<LowStockItem[]> => {
    const res = await api.get<{ success: boolean; lowStockItems: LowStockItem[] }>(
      '/admin/inventory/low-stock'
    );
    return res.lowStockItems ?? [];
  },

  getSummary: async (): Promise<InventorySummary> => {
    return api.get<InventorySummary>('/admin/inventory/summary');
  },
};
