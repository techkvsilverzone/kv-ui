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
  createdAt: string;
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

const normalizeOrder = (order: Order): Order => ({
  ...order,
  id: order.id || order._id,
});

export const orderService = {
  createOrder: async (orderData: CreateOrderPayload): Promise<Order> => {
    const order = await api.post<Order>('/orders', orderData);
    return normalizeOrder(order);
  },

  getMyOrders: async (): Promise<Order[]> => {
    const orders = await api.get<Order[]>('/orders/me');
    return orders.map(normalizeOrder);
  },
};
