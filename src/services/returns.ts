import { api } from '../lib/api';

export type ReturnFaultType = 'kv_fault' | 'customer_preference';
export type ReturnVideoStatus = 'not_required' | 'awaiting' | 'received';

export interface VideoInstructions {
  whatsappNumber: string;
  referenceCode: string;
  windowHours: number;
}

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
  faultType: ReturnFaultType;
  videoStatus: ReturnVideoStatus;
  videoReferenceCode?: string;
  videoReceivedAt?: string;
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
  faultType: ReturnFaultType;
  reason: string;
  description: string;
  items: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface CreateReturnResponse extends ReturnRequest {
  videoInstructions: VideoInstructions | null;
}

export interface ReturnPolicy {
  whatsappNumber: string;
  claimWindowHours: number;
}

export interface UnmatchedReturnVideo {
  id: string;
  _id?: string;
  senderPhone: string;
  mimeType: string;
  caption?: string;
  receivedAt: string;
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

const normalizeUnmatched = (v: any): UnmatchedReturnVideo => ({
  ...v,
  id: v.id || v._id || '',
});

export const returnsService = {
  createReturn: async (payload: CreateReturnPayload): Promise<CreateReturnResponse> => {
    const result = await api.post<CreateReturnResponse>('/returns', payload);
    return { ...normalizeReturn(result), videoInstructions: result.videoInstructions };
  },

  getReturnPolicy: async (): Promise<ReturnPolicy> => {
    return api.get<ReturnPolicy>('/returns/policy');
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

  getUnmatchedVideos: async (): Promise<UnmatchedReturnVideo[]> => {
    const data = await api.get<UnmatchedReturnVideo[]>('/admin/return-videos/unmatched');
    return data.map(normalizeUnmatched);
  },

  linkUnmatchedVideo: async (unmatchedVideoId: string, returnId: string): Promise<ReturnRequest> => {
    return api.post<ReturnRequest>(`/admin/return-videos/unmatched/${unmatchedVideoId}/link`, { returnId });
  },
};
