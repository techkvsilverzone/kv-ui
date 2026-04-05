import { forwardRef } from 'react';
import type { SavingsEnrollment } from '@/services/savings';

interface PassbookViewProps {
  scheme: SavingsEnrollment;
  userName?: string;
  userPhone?: string;
  ledger?: { date: string; description: string; amount: number; balance: number }[];
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Read-only passbook layout. Pass a `ref` when using react-to-print.
 * Includes `@media print` styles via Tailwind's print: variant.
 */
const PassbookView = forwardRef<HTMLDivElement, PassbookViewProps>(
  ({ scheme, userName, userPhone, ledger = [] }, ref) => {
    const start = new Date(scheme.startDate);
    const maturity = new Date(start);
    maturity.setMonth(maturity.getMonth() + scheme.duration);
    const passbookNumber = (scheme as any).passbookNumber ?? scheme._id.slice(-8).toUpperCase();

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900 p-8 max-w-2xl mx-auto print:p-6 print:shadow-none"
        style={{ fontFamily: 'serif' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">KV Silver Zone</h1>
            <p className="text-sm text-gray-500">Savings Scheme Passbook</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Passbook No: {passbookNumber}</p>
            <p className="text-gray-500">Issued: {formatDate(scheme.createdAt)}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Member Name</p>
            <p className="font-semibold">{userName ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
            <p className="font-semibold">{userPhone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Amount</p>
            <p className="font-semibold">{formatPrice(scheme.monthlyAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
            <p className="font-semibold">{scheme.duration} months</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Start Date</p>
            <p className="font-semibold">{formatDate(scheme.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Maturity Date</p>
            <p className="font-semibold">{formatDate(maturity.toISOString())}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Scheme Status</p>
            <p className="font-semibold capitalize">{scheme.status}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Bonus Amount</p>
            <p className="font-semibold">{formatPrice(scheme.bonusAmount)}</p>
          </div>
        </div>

        {/* Ledger */}
        <div className="mb-6">
          <h2 className="text-base font-bold mb-3 border-b border-gray-300 pb-1">Transaction Ledger</h2>
          {ledger.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No transactions recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="py-1 pr-4">Date</th>
                  <th className="py-1 pr-4">Description</th>
                  <th className="py-1 pr-4 text-right">Amount</th>
                  <th className="py-1 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-1.5 pr-4">{formatDate(row.date)}</td>
                    <td className="py-1.5 pr-4">{row.description}</td>
                    <td className="py-1.5 pr-4 text-right">{formatPrice(row.amount)}</td>
                    <td className="py-1.5 text-right font-medium">{formatPrice(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded p-4 text-sm flex justify-between">
          <span className="text-gray-600">Total Paid to Date</span>
          <span className="font-bold text-lg">{formatPrice(scheme.totalPaid)}</span>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-400 text-center print:mt-4">
          This is a computer-generated passbook. No signature required. · KV Silver Zone
        </p>
      </div>
    );
  },
);

PassbookView.displayName = 'PassbookView';

export default PassbookView;
