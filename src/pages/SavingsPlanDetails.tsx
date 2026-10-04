import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PassbookView from '@/components/PassbookView';
import SchemeDetailsView from '@/components/SchemeDetailsView';
import Seo from '@/components/Seo';
import { useAuth } from '@/context/AuthContext';
import { useInstallmentPayment } from '@/hooks/useInstallmentPayment';
import { ApiError } from '@/lib/api';
import { addressService } from '@/services/address';
import { savingsService } from '@/services/savings';
import { schemePlanService } from '@/services/schemePlan';

/** Full-page plan details for one passbook — its own route so it reads well on phones. */
const SavingsPlanDetails = () => {
  const { passbookNumber = '' } = useParams();
  const { user } = useAuth();

  const { data: scheme, isLoading, error, refetch } = useQuery({
    queryKey: ['savings-passbook', passbookNumber],
    queryFn: () => savingsService.getByPassbookNumber(passbookNumber),
    retry: false,
  });
  const { data: plans = [] } = useQuery({ queryKey: ['scheme-plans'], queryFn: schemePlanService.getPlans });

  const owner = scheme && typeof scheme.userId === 'object' ? scheme.userId : undefined;
  const isOwner = !!scheme && !!user && (owner ? owner._id === user._id : scheme.userId === user._id);
  const isFlexible = !!scheme && plans.find((p) => p.type === scheme.schemeType)?.paymentMode === 'FLEXIBLE';

  // The address is only known for the signed-in customer, so staff lookups print without it.
  const { data: myAddresses = [] } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: addressService.getAddresses,
    enabled: isOwner,
  });
  const address = myAddresses.find((a) => a.isDefault) ?? myAddresses[0];
  const addressLine = isOwner && address ? `${address.address}, ${address.city}, ${address.state} - ${address.pincode}` : undefined;

  const customerName = owner?.name || (isOwner ? user?.name : undefined);
  const customerPhone = owner?.phone || (isOwner ? user?.phone : undefined);

  const { pay, payingSchemeId } = useInstallmentPayment({
    isFlexible: () => isFlexible,
    onPaid: () => void refetch(),
  });

  const passbookRef = useRef<HTMLDivElement>(null);
  const printPassbook = useReactToPrint({
    contentRef: passbookRef,
    documentTitle: `KV-Silver-Zone-Passbook-${passbookNumber}`,
  });

  return (
    <div className="min-h-screen bg-muted/30 pb-16 pt-24">
      <Seo title={`Passbook ${passbookNumber}`} description="Your savings plan progress and payment history." />
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
            <Link to="/savings-scheme">
              <ArrowLeft className="h-4 w-4" />
              My schemes
            </Link>
          </Button>
          {scheme && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => printPassbook()}>
              <Printer className="h-3.5 w-3.5" />
              Print passbook
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !scheme ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="font-medium">
              {error instanceof ApiError && error.statusCode === 403
                ? "This passbook belongs to another customer."
                : 'No savings plan found for this passbook number.'}
            </p>
            <Button asChild variant="link" className="mt-2">
              <Link to="/savings-scheme">Back to my schemes</Link>
            </Button>
          </div>
        ) : (
          <>
            {!isFlexible && (
              <div className="rounded-xl bg-card p-4 shadow-sm sm:p-6">
                <SchemeDetailsView
                  scheme={scheme}
                  userName={customerName}
                  userPhone={customerPhone}
                  paying={payingSchemeId === scheme._id}
                  onPay={isOwner ? () => void pay(scheme) : undefined}
                />
              </div>
            )}
            {/* KV Smart Purchase Plan keeps the ledger as its main view; fixed plans only print it. */}
            <div className={isFlexible ? 'overflow-x-auto rounded-xl bg-card shadow-sm' : 'hidden'}>
              <PassbookView
                ref={passbookRef}
                scheme={scheme}
                userName={customerName}
                userPhone={customerPhone}
                userAddress={addressLine}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SavingsPlanDetails;
