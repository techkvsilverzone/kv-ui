import { api } from '../lib/api';

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  id?: string;
  /** Sequential tax invoice number generated server-side, e.g. "INV-2026-000123". */
  invoiceNumber?: string;
  items: OrderItem[];
  totalAmount: number;
  tax: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
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
  paymentStatus?: string;
  couponCode?: string | null;
  couponDiscount?: number;
  createdAt: string;
  /** 'OFFLINE' for an in-store / stall sale billed from the admin panel. */
  channel?: 'ONLINE' | 'OFFLINE';
  /** Staff member who rang up an in-store sale. */
  soldBy?: { _id: string; name: string } | null;
  /** Where an in-store sale happened, e.g. "Anna Nagar stall". */
  saleLocation?: string | null;
  /** Null for a walk-in in-store sale with no customer account. */
  userId?: string | { _id: string; name: string; email: string } | null;
}

export interface CreateOrderPayload {
  items: OrderItem[];
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
}

/* eslint-disable @typescript-eslint/no-explicit-any -- raw API payload, mapped field by field */
/**
 * The API returns PostgreSQL-shaped orders (items carry `productName`/`unitPrice`, the address
 * `name`/`line1`); the screens read the older `name`/`price` and `firstName`/`address` shape.
 * Every order from the API passes through here so both shapes resolve.
 */
export const normalizeOrder = (raw: any): Order => {
  const sa = raw?.shippingAddress ?? {};
  return {
    ...raw,
    id: raw.id || raw._id,
    channel: raw.channel === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
    items: (raw.items ?? []).map((item: any) => ({
      ...item,
      product: item.product ?? item.productId ?? '',
      name: item.name ?? item.productName ?? '',
      price: Number(item.price ?? item.unitPrice ?? 0),
      quantity: Number(item.quantity ?? 0),
      image: item.image ?? '',
    })),
    shippingAddress: {
      firstName: sa.firstName ?? sa.name ?? '',
      lastName: sa.lastName ?? '',
      address: sa.address ?? [sa.line1, sa.line2].filter(Boolean).join(', '),
      city: sa.city ?? '',
      state: sa.state ?? '',
      pincode: sa.pincode ?? '',
      phone: sa.phone ?? '',
    },
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const orderService = {
  createOrder: async (orderData: CreateOrderPayload): Promise<Order> => {
    const order = await api.post<Order>('/orders', orderData);
    return normalizeOrder(order);
  },

  getMyOrders: async (): Promise<Order[]> => {
    const orders = await api.get<Order[]>('/orders/me');
    return orders.map(normalizeOrder);
  },

  resendConfirmation: async (orderId: string): Promise<{ success: boolean; message?: string }> => {
    return api.post<{ success: boolean; message?: string }>(`/orders/${orderId}/resend-confirmation`, {});
  },
};
