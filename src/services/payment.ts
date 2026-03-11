import { api } from '../lib/api';

export interface RazorpayOrderPayload {
  amount: number;
  currency?: string;
  receipt?: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerificationPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderData: {
    items: Array<{
      product: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }>;
    shippingAddress: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
    };
    paymentMethod: string;
    totalAmount: number;
    couponCode?: string;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  orderId: string;
  message: string;
}

export const paymentService = {
  createRazorpayOrder: async (payload: RazorpayOrderPayload): Promise<RazorpayOrder> => {
    return api.post<RazorpayOrder>('/payments/create-order', payload);
  },

  verifyPayment: async (payload: PaymentVerificationPayload): Promise<PaymentVerificationResponse> => {
    return api.post<PaymentVerificationResponse>('/payments/verify', payload);
  },
};
