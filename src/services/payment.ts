import { api } from '../lib/api';

export interface RazorpayOrderPayload {
  /** Server prices the order from these line items; no client amount is trusted. */
  items: Array<{
    product: string;
    quantity: number;
    isGiftVoucher?: boolean;
    giftVoucherId?: string;
  }>;
  couponCode?: string;
  pincode?: string;
}

export interface RazorpayOrderBreakdown {
  subtotal?: number;
  taxAmount?: number;
  discount?: number;
  couponCode?: string | null;
  deliveryFee?: number;
  grandTotal?: number;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  /** Server-computed amounts for display only. */
  breakdown?: RazorpayOrderBreakdown;
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
      isGiftVoucher?: boolean;
      giftVoucherId?: string;
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
