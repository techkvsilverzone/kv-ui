import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CalendarDays, Coins, Download, Gift, Hourglass, Loader2, Scale, Store, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopHeader } from '@/components/PassbookView';
import { summarizeScheme, type Installment } from '@/lib/savingsSummary';
import type { SavingsEnrollment } from '@/services/savings';

interface SchemeDetailsViewProps {
  scheme: SavingsEnrollment;
  userName?: string;
  userPhone?: string;
  /** Omit to hide the Pay button (e.g. a staff member viewing someone else's passbook). */
  onPay?: () => void;
  paying?: boolean;
}

const money = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const grams = (n: number) => `${n.toFixed(3)} g`;
const date = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const monthLabel = (i: Installment) => (i.monthNumber === null ? 'Bonus month' : `Month ${i.monthNumber}`);

function ProgressRing({ percent, label }: { percent: number; label: string }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`${percent}% complete, ${label}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{percent}%</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

/**
 * Customer-facing month-by-month view of a FIXED savings scheme: progress, summary tiles and a
 * card per installment with a printable receipt. The full ledger stays in PassbookView (print).
 */
export default function SchemeDetailsView({ scheme, userName, userPhone, onPay, paying }: SchemeDetailsViewProps) {
  const summary = summarizeScheme(scheme);
  const metalName = scheme.metal === 'GOLD' ? 'Gold' : 'Silver';

  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptFor, setReceiptFor] = useState<Installment | null>(null);
  const printReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `KV-Silver-Zone-Receipt-${receiptFor?.payment.id ?? ''}`,
    onAfterPrint: () => setReceiptFor(null),
  });
  useEffect(() => {
    if (receiptFor) printReceipt();
  }, [receiptFor, printReceipt]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{scheme.planName ?? scheme.schemeType}</p>
            <p className="text-xs text-muted-foreground">
              {scheme.passbookNumber ? `Passbook #${scheme.passbookNumber}` : 'Passbook issued after first payment'}
              {userName ? ` · ${userName}` : ''}
            </p>
          </div>
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium">{scheme.status}</span>
        </div>
        <div className="mt-4 flex items-center gap-5">
          <ProgressRing percent={summary.progressPercent} label={`${summary.paidMonths} of ${summary.totalMonths} paid`} />
          <dl className="grid flex-1 grid-cols-1 gap-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Joined</dt>
              <dd className="font-medium">{date(scheme.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Matures</dt>
              <dd className="font-medium">{date(scheme.maturityDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Monthly amount</dt>
              <dd className="font-medium">{money(scheme.monthlyAmount)}</dd>
            </div>
          </dl>
        </div>
        {onPay && summary.nextMonth !== null && (
          <Button className="mt-4 w-full" onClick={onPay} disabled={paying}>
            {paying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Pay Month ${summary.nextMonth} of ${summary.totalMonths} (${money(scheme.monthlyAmount)})`
            )}
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile icon={Wallet} label="Total paid" value={money(summary.totalPaid)} />
        {summary.hasGrams && <Tile icon={Scale} label={`Total ${metalName.toLowerCase()}`} value={grams(summary.totalGrams)} />}
        <Tile icon={CalendarDays} label="Paid months" value={`${summary.paidMonths} of ${summary.totalMonths}`} />
        <Tile icon={Hourglass} label="Pending months" value={String(summary.pendingMonths)} />
      </div>

      {scheme.cancellation && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          Cancelled on {date(scheme.cancellation.cancelledAt)} — net redeemable{' '}
          <span className="font-semibold">{money(scheme.cancellation.netRedeemable)}</span> (goods only).
        </p>
      )}

      {/* Month-wise history */}
      <section>
        <h3 className="mb-2 text-sm font-semibold">Payment history</h3>
        {summary.installments.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <ul className="space-y-3">
            {summary.installments
              .slice()
              .reverse()
              .map((inst, idx) => {
                const p = inst.payment;
                const isBonus = inst.monthNumber === null;
                const rate = isBonus ? p.devidentMaterialRate : p.materialRate;
                const amount = isBonus ? p.devidentAmount : p.amount;
                return (
                  <li key={p.id ?? idx} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {isBonus ? <Gift className="h-4 w-4" /> : String(inst.monthNumber).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{monthLabel(inst)}</p>
                        <p className="text-xs text-muted-foreground">{date(p.paidAt)}</p>
                      </div>
                      {p.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Download receipt for ${monthLabel(inst)}`}
                          onClick={() => setReceiptFor(inst)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <dl className={`mt-3 grid gap-2 text-center text-sm ${summary.hasGrams ? 'grid-cols-3' : 'grid-cols-1'}`}>
                      {summary.hasGrams && (
                        <div>
                          <dt className="text-xs text-muted-foreground">Rate /g</dt>
                          <dd className="font-medium">{money(rate)}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs text-muted-foreground">{isBonus ? 'Bonus' : 'Amount'}</dt>
                        <dd className="font-medium">{money(amount)}</dd>
                      </div>
                      {summary.hasGrams && (
                        <div>
                          <dt className="text-xs text-muted-foreground">Weight</dt>
                          <dd className="font-medium">{grams(inst.grams)}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {isBonus ? (
                          <><Coins className="h-3.5 w-3.5" /> Credited by KV Silver Zone</>
                        ) : p.method === 'CASH' ? (
                          <><Store className="h-3.5 w-3.5" /> Paid in store</>
                        ) : (
                          <><Smartphone className="h-3.5 w-3.5" /> Paid online</>
                        )}
                      </span>
                      {p.id && <span>Receipt No. {p.id}</span>}
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      {/* Printable receipt for the chosen installment (rendered off-screen) */}
      <div className="hidden">
        <div ref={receiptRef} className="bg-white p-6 text-sm text-gray-900">
          {receiptFor && (
            <>
              <ShopHeader title="Payment Receipt" />
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Receipt No', receiptFor.payment.id ?? '—'],
                    ['Passbook No', scheme.passbookNumber ?? '—'],
                    ['Customer', userName ?? '—'],
                    ['Mobile', userPhone ?? '—'],
                    ['Plan', scheme.planName ?? scheme.schemeType],
                    [
                      'Installment',
                      receiptFor.monthNumber === null ? 'Bonus month' : `Month ${receiptFor.monthNumber} of ${summary.totalMonths}`,
                    ],
                    ['Date', date(receiptFor.payment.paidAt)],
                    [
                      receiptFor.monthNumber === null ? 'Bonus amount' : 'Amount',
                      money(receiptFor.monthNumber === null ? receiptFor.payment.devidentAmount : receiptFor.payment.amount),
                    ],
                    ...(summary.hasGrams
                      ? [
                          [
                            `${metalName} rate /g`,
                            money(receiptFor.monthNumber === null ? receiptFor.payment.devidentMaterialRate : receiptFor.payment.materialRate),
                          ],
                          [`${metalName} credited`, grams(receiptFor.grams)],
                        ]
                      : []),
                    [
                      'Payment mode',
                      receiptFor.monthNumber === null ? 'Bonus credit' : receiptFor.payment.method === 'CASH' ? 'Cash (in store)' : 'Online',
                    ],
                    ...(receiptFor.payment.razorpayPaymentId ? [['Transaction ID', receiptFor.payment.razorpayPaymentId]] : []),
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-gray-200">
                      <td className="py-1.5 pr-4 text-gray-600">{k}</td>
                      <td className="py-1.5 font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-6 text-center text-xs text-gray-400">
                This is a computer-generated receipt. No signature required. · KV Silver Zone
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
