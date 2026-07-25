import { forwardRef } from 'react';
import type { SavingsEnrollment } from '@/services/savings';

interface PassbookViewProps {
  scheme: SavingsEnrollment;
  userName?: string;
  userPhone?: string;
  userAddress?: string;
}

const formatMoney = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const formatGrams = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

interface LedgerRow {
  no: number;
  date: string;
  collection: number;
  materialRate: number;
  materialWeight: number;
  devident: number;
  devidentMaterialRate: number;
  devidentMaterialWeight: number;
  total: number;
  cumulative: number;
}

/** Row-local Total + running Cumulative, always derived at render time from the raw
 * per-row fields — never stored — so an admin correcting a past row never leaves a stale
 * total/cumulative behind (see savings.service.ts adminUpdatePaymentRow). */
function buildLedgerRows(scheme: SavingsEnrollment): LedgerRow[] {
  let cumulative = 0;
  return (scheme.payments ?? [])
    .slice()
    .sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime())
    .map((p, i) => {
      const total = p.materialWeight + p.devidentMaterialWeight;
      cumulative += total;
      return {
        no: i + 1,
        date: p.paidAt,
        collection: p.amount,
        materialRate: p.materialRate,
        materialWeight: p.materialWeight,
        devident: p.devidentAmount,
        devidentMaterialRate: p.devidentMaterialRate,
        devidentMaterialWeight: p.devidentMaterialWeight,
        total,
        cumulative,
      };
    });
}

/**
 * Read-only passbook layout, matching the shop's existing paper ledger format — every
 * collection converted to silver grams at that day's rate, with a running cumulative
 * weight. Pass a `ref` when using react-to-print (the parent's "Export/Print" button).
 * Includes `@media print` styles via Tailwind's print: variant.
 */
const PassbookView = forwardRef<HTMLDivElement, PassbookViewProps>(
  ({ scheme, userName, userPhone, userAddress }, ref) => {
    const rows = buildLedgerRows(scheme);
    const finalCumulative = rows[rows.length - 1]?.cumulative ?? 0;
    const totals = rows.reduce(
      (acc, r) => ({
        collection: acc.collection + r.collection,
        materialRate: acc.materialRate + r.materialRate,
        materialWeight: acc.materialWeight + r.materialWeight,
        devident: acc.devident + r.devident,
        devidentMaterialRate: acc.devidentMaterialRate + r.devidentMaterialRate,
        devidentMaterialWeight: acc.devidentMaterialWeight + r.devidentMaterialWeight,
        total: acc.total + r.total,
      }),
      { collection: 0, materialRate: 0, materialWeight: 0, devident: 0, devidentMaterialRate: 0, devidentMaterialWeight: 0, total: 0 },
    );

    const mb = scheme.maturityBenefits;
    const hasMaturityBenefits = !!mb && (!!mb.goldCoinValue || !!mb.silverGrams || (mb.gifts?.length ?? 0) > 0);

    return (
      <div ref={ref} className="bg-white text-gray-900 p-6 max-w-4xl mx-auto print:p-4 print:shadow-none text-sm">
        {/* Shop header */}
        <div className="text-center mb-4 pb-3 border-b-2 border-gray-800">
          <h1 className="text-2xl font-bold tracking-wide">KV Silver Zone</h1>
          <p className="text-xs text-gray-600 mt-1">
            14, Rajaram St, Gnanamoorthy Nagar Extn, Town Planning Colony, Ambattur, Chennai 600053
          </p>
          <p className="text-xs text-gray-600">Mobile: (+91) 88256 49680</p>
          <p className="text-sm font-semibold underline mt-2">Ledger Statement</p>
        </div>

        {/* Name / Address / Mobile — Ticket No / CD / Chit Amount */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 border border-gray-300 p-3">
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Name</span>
            <span className="font-semibold">: {userName ?? '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Ticket No</span>
            <span className="font-semibold">: {scheme.passbookNumber ?? 'Pending (issued after first payment)'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Address</span>
            <span className="font-semibold">: {userAddress ?? '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">CD</span>
            <span className="font-semibold">: {formatDate(scheme.startDate)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Mobile No</span>
            <span className="font-semibold">: {userPhone ?? '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Chit Amount</span>
            <span className="font-semibold">: {formatMoney(scheme.monthlyAmount)}</span>
          </div>
        </div>

        {/* Ledger table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border border-gray-400 bg-gray-50">
                {['No', 'Collection Date', 'Collection', 'Material Rate', 'Material Weight (Grm)', 'Devident', 'Devident Material Rate', 'Devident Material Weight (Grm)', 'Total', 'Cumulative'].map(
                  (h) => (
                    <th key={h} className="border border-gray-300 px-2 py-1.5 font-semibold text-center">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border border-gray-300 px-2 py-4 text-center text-gray-500 italic">
                    No collections recorded yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.no}>
                    <td className="border border-gray-300 px-2 py-1 text-center">{r.no}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">{formatDate(r.date)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(r.collection)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(r.materialRate)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatGrams(r.materialWeight)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(r.devident)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatMoney(r.devidentMaterialRate)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatGrams(r.devidentMaterialWeight)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right font-medium">{formatGrams(r.total)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right font-medium">{formatGrams(r.cumulative)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border border-gray-400 bg-gray-50 font-semibold">
                  <td className="border border-gray-300 px-2 py-1.5 text-center" colSpan={2}>
                    Total
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatMoney(totals.collection)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatMoney(totals.materialRate)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatGrams(totals.materialWeight)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatMoney(totals.devident)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatMoney(totals.devidentMaterialRate)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatGrams(totals.devidentMaterialWeight)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatGrams(totals.total)}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-right">{formatGrams(finalCumulative)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded p-3 mt-4 text-sm flex flex-wrap justify-between gap-2">
          <span className="text-gray-600">Total Paid to Date</span>
          <span className="font-bold">₹{formatMoney(scheme.totalPaid)} · {formatGrams(finalCumulative)} g silver</span>
        </div>

        {/* Maturity benefits */}
        {hasMaturityBenefits && (
          <div className="mt-4 border border-gray-300 rounded p-3">
            <h2 className="text-sm font-bold mb-2">Maturity Benefits</h2>
            <ul className="text-sm space-y-1">
              {!!mb?.goldCoinValue && <li>₹{formatMoney(mb.goldCoinValue)} — Gold Coin</li>}
              {!!mb?.silverGrams && <li>{formatGrams(mb.silverGrams)} Grams — Silver Coin/Article</li>}
              {mb?.gifts?.map((gift, i) => <li key={i}>{gift}</li>)}
            </ul>
          </div>
        )}

        {/* Footer */}
        <p className="mt-4 text-xs text-gray-400 text-center print:mt-3">
          This is a computer-generated passbook. No signature required. · KV Silver Zone
        </p>
      </div>
    );
  },
);

PassbookView.displayName = 'PassbookView';

export default PassbookView;
