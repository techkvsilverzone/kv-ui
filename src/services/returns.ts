import { api } from '../lib/api';

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  userName?: string;
  reason: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  refundAmount: number;
  items: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnPayload {
  orderId: string;
  reason: string;
  description: string;
  items: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const returnsService = {
  createReturn: async (payload: CreateReturnPayload): Promise<ReturnRequest> => {
    return api.post<ReturnRequest>('/returns', payload);
  },

  getMyReturns: async (): Promise<ReturnRequest[]> => {
    return api.get<ReturnRequest[]>('/returns/me');
  },

  // Admin
  getAllReturns: async (): Promise<ReturnRequest[]> => {
    return api.get<ReturnRequest[]>('/admin/returns');
  },

  updateReturnStatus: async (id: string, status: string, refundAmount?: number): Promise<ReturnRequest> => {
    return api.put<ReturnRequest>(`/admin/returns/${id}`, { status, refundAmount });
  },
};
