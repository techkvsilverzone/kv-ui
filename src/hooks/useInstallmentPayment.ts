import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api';
import { loadRazorpayScript } from '@/lib/razorpay';
import { summarizeScheme } from '@/lib/savingsSummary';
import { savingsService, type SavingsEnrollment } from '@/services/savings';

const formatGrams = (grams: number) => `${grams.toFixed(3)}g`;
const formatPrice = (price: number) =>
  Number.isFinite(price)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
    : '—';

/**
 * Pays a savings installment online via Razorpay. FIXED-mode schemes always use the server-known
 * scheme.monthlyAmount — the client never sends/trusts an amount for those. FLEXIBLE-mode schemes
 * (KV Smart Purchase Plan) require `customAmount`, validated server-side against the plan's floor.
 */
export function useInstallmentPayment({
  isFlexible,
  onPaid,
}: {
  isFlexible: (scheme: SavingsEnrollment) => boolean;
  onPaid?: (scheme: SavingsEnrollment) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payingSchemeId, setPayingSchemeId] = useState<string | null>(null);

  const pay = async (scheme: SavingsEnrollment, customAmount?: number) => {
    setPayingSchemeId(scheme._id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: 'Payment Error', description: 'Failed to load payment gateway.', variant: 'destructive' });
        setPayingSchemeId(null);
        return;
      }

      const order = await savingsService.createInstallmentOrder(scheme._id, customAmount);
      const paidAmount = order.amount / 100;

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'KV Silver Zone',
        description: `Savings installment - ${scheme.planName || 'Savings Scheme'}`,
        order_id: order.id,
        prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
        theme: { color: '#1a1a1a' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const result = await savingsService.verifyInstallmentPayment(scheme._id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (!result.success) return;

            // Match on the Razorpay payment id rather than "the last row", so an auto-credited
            // bonus row landing in the same response can't be mistaken for this payment.
            const creditedRow = result.scheme.payments?.find((p) => p.razorpayPaymentId === response.razorpay_payment_id);
            if (isFlexible(scheme)) {
              const gramNote = creditedRow && creditedRow.materialWeight > 0
                ? ` — ${formatGrams(creditedRow.materialWeight)} ${scheme.metal === 'GOLD' ? 'Gold' : 'Silver'} credited at today's rate of ${formatPrice(creditedRow.materialRate)}/g.`
                : '';
              toast({
                title: 'Payment Successful!',
                description: `₹${paidAmount.toLocaleString('en-IN')} recorded on your passbook.${gramNote}`,
              });
            } else {
              const after = summarizeScheme(result.scheme);
              const gramsNote = after.hasGrams && creditedRow
                ? ` ${formatGrams(creditedRow.materialWeight)} added at ${formatPrice(creditedRow.materialRate)}/g · total now ${formatGrams(after.totalGrams)}.`
                : '';
              toast({
                title: `Month ${after.paidMonths} of ${after.totalMonths} paid`,
                description: `₹${paidAmount.toLocaleString('en-IN')} received.${gramsNote} ${after.pendingMonths} month${after.pendingMonths === 1 ? '' : 's'} pending.`,
              });
            }
            onPaid?.(result.scheme);
          } catch {
            toast({ title: 'Verification Failed', description: 'Payment verification failed. Contact support.', variant: 'destructive' });
          } finally {
            setPayingSchemeId(null);
          }
        },
        modal: { ondismiss: () => setPayingSchemeId(null) },
      });
      rzp.open();
    } catch (error) {
      toast({
        title: 'Payment failed',
        description: error instanceof ApiError ? error.message : 'Could not initiate payment.',
        variant: 'destructive',
      });
      setPayingSchemeId(null);
    }
  };

  return { pay, payingSchemeId };
}
