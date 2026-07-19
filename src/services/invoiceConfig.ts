import { api } from '../lib/api';

/** Company details (GSTIN, address) printed on customer-facing tax invoices. */
export interface InvoiceConfig {
  companyName: string;
  gstin: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

export const DEFAULT_INVOICE_CONFIG: InvoiceConfig = {
  companyName: 'KV Silver Zone',
  gstin: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
};

type ApiInvoiceConfig = Partial<InvoiceConfig>;

interface InvoiceConfigResponse {
  status?: string;
  data?: ApiInvoiceConfig;
}

const parseConfig = (cfg?: ApiInvoiceConfig): InvoiceConfig => ({
  companyName: cfg?.companyName || DEFAULT_INVOICE_CONFIG.companyName,
  gstin: cfg?.gstin ?? DEFAULT_INVOICE_CONFIG.gstin,
  companyAddress: cfg?.companyAddress ?? DEFAULT_INVOICE_CONFIG.companyAddress,
  companyPhone: cfg?.companyPhone ?? DEFAULT_INVOICE_CONFIG.companyPhone,
  companyEmail: cfg?.companyEmail ?? DEFAULT_INVOICE_CONFIG.companyEmail,
});

const unwrap = (res: InvoiceConfigResponse | ApiInvoiceConfig): ApiInvoiceConfig =>
  (res as InvoiceConfigResponse)?.data ?? (res as ApiInvoiceConfig);

export const invoiceConfigService = {
  /** Public read — used by InvoiceView to print company/GSTIN details on the invoice. */
  getInvoiceConfig: async (): Promise<InvoiceConfig> => {
    try {
      const res = await api.get<InvoiceConfigResponse | ApiInvoiceConfig>('/invoice-config');
      return parseConfig(unwrap(res));
    } catch {
      return DEFAULT_INVOICE_CONFIG;
    }
  },

  /** Admin read of the editable config. */
  getAdminInvoiceConfig: async (): Promise<InvoiceConfig> => {
    const res = await api.get<InvoiceConfigResponse | ApiInvoiceConfig>('/admin/invoice-config');
    return parseConfig(unwrap(res));
  },

  /** Admin update (partial). */
  updateInvoiceConfig: async (payload: Partial<InvoiceConfig>): Promise<InvoiceConfig> => {
    const res = await api.put<InvoiceConfigResponse | ApiInvoiceConfig>('/admin/invoice-config', payload);
    return parseConfig(unwrap(res));
  },
};
