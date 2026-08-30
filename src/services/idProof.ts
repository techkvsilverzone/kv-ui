import { api } from '../lib/api';

export type IdProofType = 'AADHAAR' | 'PAN' | 'VOTER_ID' | 'DRIVING_LICENSE';
export type IdProofVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface IdProofOwner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface UserIdProof {
  _id: string;
  userId: string | IdProofOwner;
  idProofType: IdProofType;
  idProofNumber: string;
  imageUrl: string;
  verificationStatus: IdProofVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface SubmitIdProofPayload {
  idProofType: IdProofType;
  idProofNumber: string;
  /** Base64 data URI of a photo of the document. */
  image: string;
}

/** Item 2 — customer's own KYC submission, required once before the first savings-scheme
 * enrollment (`SavingsScheme.tsx`). Verification is async/non-blocking. */
export const idProofService = {
  getMine: async (): Promise<UserIdProof | null> => {
    return api.get<UserIdProof | null>('/users/me/id-proof');
  },

  submit: async (payload: SubmitIdProofPayload): Promise<UserIdProof> => {
    return api.post<UserIdProof>('/users/me/id-proof', payload);
  },
};
