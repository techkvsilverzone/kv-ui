import { api } from '../lib/api';

export interface ReturnRequest {
  id: string;
  _id?: string;
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

const normalizeReturn = (r: any): ReturnRequest => {
  // userId and orderId may be populated objects from MongoDB (e.g. { _id, name, email })
  const userObj = typeof r.userId === 'object' && r.userId !== null ? r.userId : null;
  const orderObj = typeof r.orderId === 'object' && r.orderId !== null ? r.orderId : null;
  return {
    ...r,
    id: r.id || r._id || '',
    userId: userObj ? String(userObj._id || '') : String(r.userId || ''),
    userName: r.userName || userObj?.name || '',
    orderId: orderObj ? String(orderObj._id || '') : String(r.orderId || ''),
  };
};

export const returnsService = {
  createReturn: async (payload: CreateReturnPayload): Promise<ReturnRequest> => {
    return api.post<ReturnRequest>('/returns', payload);
  },

  getMyReturns: async (): Promise<ReturnRequest[]> => {
    const data = await api.get<ReturnRequest[]>('/returns/me');
    return data.map(normalizeReturn);
  },

  // Admin
  getAllReturns: async (): Promise<ReturnRequest[]> => {
    const data = await api.get<ReturnRequest[]>('/admin/returns');
    return data.map(normalizeReturn);
  },

  updateReturnStatus: async (id: string, status: string, refundAmount?: number): Promise<ReturnRequest> => {
    return api.put<ReturnRequest>(`/admin/returns/${id}`, { status, refundAmount });
  },
};
