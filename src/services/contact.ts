import { api } from '../lib/api';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  sendEnquiry: async (payload: ContactPayload): Promise<{ message: string }> => {
    return api.post<{ message: string }>('/contact', payload);
  },
};
