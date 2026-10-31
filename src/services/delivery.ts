import { api } from '../lib/api';

/** Result of the public `GET /delivery/check` pincode lookup. */
export interface PincodeCheck {
  pincode: string;
  available: boolean;
  /** False when the postal directory was unreachable: treat as available, but city/fee are unknown. */
  verified: boolean;
  city?: string;
  state?: string;
  deliveryZone?: 'chennai' | 'otherDistrict' | 'otherState' | null;
  deliveryFee?: number | null;
  estimatedDays?: string;
  reason?: string;
}

export const deliveryService = {
  checkPincode: async (pincode: string): Promise<PincodeCheck> => {
    return api.get<PincodeCheck>(`/delivery/check?pincode=${encodeURIComponent(pincode)}`);
  },
};
