import { api } from '../lib/api';

export interface GiftVoucher {
  id: string;
  name: string;
  price: number;
  description: string;
  tag?: string;
  isActive: boolean;
  sortOrder: number;
}

// Matches the GiftVoucher schema in openapi.json (label + amount + sortOrder),
// with extra fallbacks kept for resilience.
interface ApiGiftVoucher {
  _id?: string;
  id?: string;
  label?: string;
  name?: string;
  amount?: number;
  value?: number;
  price?: number;
  description?: string;
  tag?: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface GiftVouchersResponse {
  status?: string;
  data?: ApiGiftVoucher[];
}

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const normalize = (v: ApiGiftVoucher): GiftVoucher => {
  const price = Number(v.amount ?? v.value ?? v.price ?? 0);
  return {
    id: String(v.id ?? v._id ?? ''),
    name: v.label ?? v.name ?? `${formatINR(price)} Gift Voucher`,
    price,
    description: v.description ?? '',
    tag: v.tag,
    isActive: v.isActive ?? true,
    sortOrder: v.sortOrder ?? 0,
  };
};

export const giftVoucherService = {
  getGiftVouchers: async (): Promise<GiftVoucher[]> => {
    // The endpoint returns `{ status, data: [...] }`; tolerate a bare array too.
    const res = await api.get<GiftVouchersResponse | ApiGiftVoucher[]>('/gift-vouchers');
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return list
      .map(normalize)
      .filter((v) => v.isActive && v.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
};
