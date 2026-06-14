import { api } from '../lib/api';

/** Matches the Address schema in openapi.json. */
export interface Address {
  id: string;
  label?: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

/** Body for create/update (AddressInput in openapi.json) — no `id`. */
export type AddressInput = Omit<Address, 'id'>;

const normalize = (a: Address & { _id?: string }): Address => ({
  ...a,
  id: a.id ?? a._id ?? '',
});

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const data = await api.get<(Address & { _id?: string })[]>('/users/me/addresses');
    return Array.isArray(data) ? data.map(normalize) : [];
  },

  createAddress: async (body: AddressInput): Promise<Address> => {
    return normalize(await api.post<Address>('/users/me/addresses', body));
  },

  updateAddress: async (id: string, body: AddressInput): Promise<Address> => {
    return normalize(await api.put<Address>(`/users/me/addresses/${id}`, body));
  },

  deleteAddress: async (id: string): Promise<void> => {
    return api.delete<void>(`/users/me/addresses/${id}`);
  },
};
