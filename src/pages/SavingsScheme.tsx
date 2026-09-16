import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Calculator, Calendar, Gift, Shield, BookOpen, Loader2, Search, Printer, Coins } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import savingsImage from '@/assets/savings-scheme.jpg';
import { savingsService, type SavingsEnrollment } from '@/services/savings';
import { schemePlanService, type SchemePlan, type SchemeType } from '@/services/schemePlan';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PassbookView from '@/components/PassbookView';
import { loadRazorpayScript } from '@/lib/razorpay';
import { addressService } from '@/services/address';
import { ApiError } from '@/lib/api';
import { silverRateService } from '@/services/silverRate';
import { goldRateService } from '@/services/goldRate';

const formatGrams = (grams: number) => `${grams.toFixed(3)}g`;

const formatPrice = (price: number) => {
  if (!Number.isFinite(price)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-muted text-muted-foreground',
  Dropped: 'bg-red-100 text-red-700',
};

const SavingsScheme = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState<SchemeType | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<SavingsEnrollment | null>(null);
  const [passbookSearch, setPassbookSearch] = useState('');
  const [isSearchingPassbook, setIsSearchingPassbook] = useState(false);
  const [payingSchemeId, setPayingSchemeId] = useState<string | null>(null);
  // Item 4: per-scheme amount entry for FLEXIBLE-mode (KV Smart Purchase Plan) payments, keyed
  // by scheme id since several flexible schemes can be listed in "My Schemes" at once.
  const [flexPayAmounts, setFlexPayAmounts] = useState<Record<string, string>>({});
  const passbookRef = useRef<HTMLDivElement>(null);
  const handlePrintPassbook = useReactToPrint({
    contentRef: passbookRef,
    documentTitle: `KV-Silver-Zone-Passbook-${selectedScheme?.passbookNumber ?? ''}`,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['scheme-plans'],
    queryFn: schemePlanService.getPlans,
  });

  // Today's metal rates, purely for the "≈ X.XXXg at today's rate" estimate shown while
  // choosing/paying an amount — the actual gram figure credited to the passbook is always
  // computed and stored server-side (see `materialRate`/`materialWeight` on each payment row).
  const { data: silverRates = [] } = useQuery({
    queryKey: ['silver-rate-today'],
    queryFn: silverRateService.getTodayRate,
  });
  const { data: goldRates = [] } = useQuery({
    queryKey: ['gold-rate-today'],
    queryFn: goldRateService.getTodayRate,
  });
  const todaySilverRate = silverRates[0]?.ratePerGram;
  const todayGoldRate = goldRates[0]?.ratePerGram;

  // Item 2 (replaced 2026-09-16, was KYC-gated): every enrollment attempt requires a fresh OTP
  // confirmation sent to the customer's phone (WhatsApp, falling back to email) instead of an
  // admin-reviewed ID proof — instant/self-serve rather than waiting on async review.
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [enrollOtp, setEnrollOtp] = useState('');
  const [otpChannel, setOtpChannel] = useState<'whatsapp' | 'email' | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  // Default to the first available plan once the catalog loads.
  useEffect(() => {
    if (plans.length === 0 || selectedType) return;
    setSelectedType(plans[0].type);
    setSelectedAmount(plans[0].monthlyAmounts[0] ?? null);
  }, [plans, selectedType]);

  const selectedPlan: SchemePlan | undefined = plans.find((p) => p.type === selectedType);

  const handleSelectPlan = (plan: SchemePlan) => {
    setSelectedType(plan.type);
    setSelectedAmount(plan.monthlyAmounts[0] ?? null);
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTrackPassbook = async (value?: string) => {
    const query = value ?? passbookSearch;
    if (!query.trim()) return;
    setIsSearchingPassbook(true);
    try {
      const scheme = await savingsService.getByPassbookNumber(query);
      setSelectedScheme(scheme);
    } catch {
      toast({
        title: 'Not found',
        description: 'No savings scheme matches that passbook number.',
        variant: 'destructive',
      });
    } finally {
      setIsSearchingPassbook(false);
    }
  };

  // Deep-link from CustomerDashboard's "Passbook" button (?passbook=PB-...).
  useEffect(() => {
    const fromQuery = searchParams.get('passbook');
    if (fromQuery) {
      setPassbookSearch(fromQuery);
      void handleTrackPassbook(fromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: mySchemes = [], isLoading: schemesLoading, refetch: refetchSchemes } = useQuery({
    queryKey: ['my-savings'],
    queryFn: savingsService.getMySchemes,
    enabled: isAuthenticated,
  });

  // Default saved address, shown on the passbook header — mirrors the same
  // find(isDefault) ?? [0] fallback Payment.tsx already uses.
  const { data: myAddresses = [] } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: addressService.getAddresses,
    enabled: isAuthenticated,
  });
  const defaultAddress = myAddresses.find((a) => a.isDefault) ?? myAddresses[0];
  const userAddressLine = defaultAddress
    ? `${defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}`
    : undefined;

  const todayRateForPlan = selectedPlan?.metal === 'GOLD' ? todayGoldRate : selectedPlan?.metal === 'SILVER' ? todaySilverRate : undefined;
  const estimatedGrams = selectedAmount && todayRateForPlan ? selectedAmount / todayRateForPlan : null;

  const isFlexiblePlan = selectedPlan?.paymentMode === 'FLEXIBLE';

  const summary = useMemo(() => {
    // Item 4: a FLEXIBLE plan has no fixed monthly cadence to project a total from — the
    // Calculator panel shows a different, simpler summary for it (see JSX below).
    if (!selectedPlan || isFlexiblePlan || !selectedAmount) return null;
    const totalPaid = selectedAmount * selectedPlan.durationMonths;
    // Diwali has no ledger-credited bonus row (bonusMonths is 0 for it) but its redemption
    // payout formula still credits 1 month's worth of value — just via gold/silver/gifts
    // instead of a ledger row. Treat any hamper-based plan as a 1-month bonus for display.
    const bonusMonths = selectedPlan.hamper ? 1 : selectedPlan.bonusMonths;
    const bonusAmount = selectedAmount * bonusMonths;
    return { totalPaid, bonusAmount, totalValue: totalPaid + bonusAmount };
  }, [selectedPlan, selectedAmount]);

  const benefits = [
    {
      icon: Gift,
      title: 'Choose Your Scheme',
      description: 'Gold Purchase Plan, Silver Purchase Plan, or the Diwali hamper scheme — each with its own rules and rewards.',
    },
    {
      icon: Shield,
      title: 'Price Locked-In',
      description: 'Every installment is converted to grams at that day\'s rate, protecting you from future price rises.',
    },
    {
      icon: Calendar,
      title: 'Fixed Monthly Amounts',
      description: 'Pick a plan\'s published monthly amount and pay by the 10th of each month.',
    },
    {
      icon: Check,
      title: 'Zero Making Charges',
      description: 'No making charges when you redeem your scheme for coins, bars, or pooja articles.',
    },
  ];

  /** The actual enroll API call + success handling, run once the OTP dialog is confirmed. */
  const performEnroll = async (otp: string) => {
    if (!selectedPlan || (!isFlexiblePlan && !selectedAmount)) return;
    setIsEnrolling(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await savingsService.enroll({
        schemeType: selectedPlan.type,
        // FLEXIBLE plans (item 4) have no customer-chosen amount at enrollment — the server
        // ignores this field for them and stores the plan's own minPaymentAmount instead.
        monthlyAmount: isFlexiblePlan ? (selectedPlan.minPaymentAmount ?? 0) : (selectedAmount as number),
        startDate: today.toISOString().split('T')[0],
        otp,
      });

      toast({
        title: 'Enrollment Initiated',
        description: `Your ${selectedPlan.name} scheme is now active. Your passbook will be issued after your first payment.`,
      });
      void refetchSchemes();
    } catch (error) {
      toast({
        title: 'Enrollment failed',
        description: error instanceof Error ? error.message : 'Unable to enroll right now.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to enroll in a savings scheme.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    if (!selectedPlan || (!isFlexiblePlan && !selectedAmount)) {
      toast({ title: 'Choose a plan', description: 'Select a scheme and monthly amount first.', variant: 'destructive' });
      return;
    }

    // Item 2 (replaced 2026-09-16, was KYC-gated): every enrollment attempt sends a fresh OTP
    // confirmation to the customer's phone rather than checking a KYC document — self-serve
    // and instant instead of waiting on async admin review.
    setIsRequestingOtp(true);
    try {
      const result = await savingsService.requestEnrollOtp();
      setOtpChannel(result.channel);
      setEnrollOtp('');
      setShowOtpForm(true);
    } catch (error) {
      toast({
        title: 'Could not send confirmation code',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleConfirmEnrollOtp = async () => {
    if (!enrollOtp.trim()) {
      toast({ title: 'Enter the code', description: 'Enter the confirmation code sent to your phone.', variant: 'destructive' });
      return;
    }
    setShowOtpForm(false);
    await performEnroll(enrollOtp.trim());
  };

  /** Pay this scheme's next installment online via Razorpay. FIXED-mode schemes always use the
   * server-known scheme.monthlyAmount — the client never sends/trusts an amount for those.
   * FLEXIBLE-mode schemes (item 4, KV Smart Purchase Plan) require `customAmount`, chosen by the
   * customer and validated server-side against the plan's floor. */
  const handlePayInstallment = async (scheme: SavingsEnrollment, customAmount?: number) => {
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

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'KV Silver Zone',
        description: `Savings installment - ${scheme.planName || 'Savings Scheme'}`,
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#1a1a1a' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const result = await savingsService.verifyInstallmentPayment(scheme._id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (result.success) {
              // Pinpoint the exact ledger row this payment created (not just "the last row") —
              // matching on the Razorpay payment id avoids any ambiguity with an auto-credited
              // bonus row landing in the same response.
              const creditedRow = result.scheme.payments?.find(
                (p) => (p as { razorpayPaymentId?: string }).razorpayPaymentId === response.razorpay_payment_id,
              );
              const gramNote = creditedRow && creditedRow.materialWeight > 0
                ? ` — ${formatGrams(creditedRow.materialWeight)} ${scheme.metal === 'GOLD' ? 'Gold' : 'Silver'} credited at today's rate of ${formatPrice(creditedRow.materialRate)}/g.`
                : '';
              toast({
                title: 'Payment Successful!',
                description: `₹${paidAmount.toLocaleString('en-IN')} recorded on your passbook.${gramNote}`,
              });
              void refetchSchemes();
            }
          } catch {
            toast({ title: 'Verification Failed', description: 'Payment verification failed. Contact support.', variant: 'destructive' });
          } finally {
            setPayingSchemeId(null);
          }
        },
        modal: {
          ondismiss: () => setPayingSchemeId(null),
        },
      };

      const rzp = new window.Razorpay(options);
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

  return (
    <div className="min-h-screen pt-24">
      <Seo
        title="Savings Schemes"
        description="Join KV Silver Zone's Gold Purchase Plan, Silver Purchase Plan, or Diwali savings schemes — save monthly and build your gold/silver collection. Flexible plans with transparent terms."
      />
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                💰 Monthly Savings Schemes
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Secure Your Gold & Silver<br />Future Today
              </h1>
              <p className="text-lg opacity-80 mb-8">
                Choose from our Gold Purchase Plan, Silver Purchase Plan, or Diwali savings schemes and build your
                collection systematically — pay monthly, redeem for jewellery or a festival hamper.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground btn-shine"
                  onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Schemes
                  <Calculator className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-elegant animate-float">
                <img
                  src={savingsImage}
                  alt="Savings Scheme"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Why Choose Our Schemes?
            </h2>
            <p className="text-muted-foreground mt-2">
              Maximize your savings with exclusive benefits
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center card-hover">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plan picker */}
      <section id="plans" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground">Our Schemes</h2>
            <p className="text-muted-foreground mt-2">Pick the scheme that suits you — each redeems differently</p>
          </div>
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center text-muted-foreground">No schemes are open for enrollment right now — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const isSelected = plan.type === selectedType;
                return (
                  <Card
                    key={plan._id}
                    className={`p-6 flex flex-col gap-3 cursor-pointer transition-shadow ${isSelected ? 'ring-2 ring-primary shadow-elegant' : 'card-hover'}`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-accent" />
                      <h3 className="font-serif text-xl font-semibold">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{plan.description}</p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{plan.durationMonths} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{plan.paymentMode === 'FLEXIBLE' ? 'Minimum' : 'From'}</span>
                        <span className="font-medium">
                          {plan.paymentMode === 'FLEXIBLE'
                            ? `${formatPrice(plan.minPaymentAmount ?? 0)}, any time`
                            : `${formatPrice(Math.min(...plan.monthlyAmounts))}/mo`}
                        </span>
                      </div>
                      {plan.bonusMonths > 0 ? (
                        <div className="flex justify-between text-primary">
                          <span>Bonus</span>
                          <span className="font-medium">+{plan.bonusMonths} month value</span>
                        </div>
                      ) : plan.hamper ? (
                        <div className="flex justify-between text-primary">
                          <span>Reward</span>
                          <span className="font-medium">Diwali hamper</span>
                        </div>
                      ) : null}
                    </div>
                    <Button variant={isSelected ? 'default' : 'outline'} size="sm" className="mt-2 w-full">
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* My Active Schemes */}
      {isAuthenticated && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground">My Schemes</h2>
              <div className="flex gap-2 max-w-sm w-full sm:w-auto">
                <Input
                  placeholder="Track by passbook number"
                  value={passbookSearch}
                  onChange={(e) => setPassbookSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackPassbook()}
                  className="text-sm"
                />
                <Button variant="outline" size="sm" onClick={() => handleTrackPassbook()} disabled={isSearchingPassbook} className="gap-1.5 shrink-0">
                  {isSearchingPassbook ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  Track
                </Button>
              </div>
            </div>
            {schemesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : mySchemes.length === 0 ? (
              <p className="text-muted-foreground text-sm">You have no schemes yet. Pick one above!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySchemes.map((scheme) => {
                  const realPaymentsCount = (scheme.payments ?? []).filter((p) => p.amount > 0).length;
                  const schemePlan = plans.find((p) => p.type === scheme.schemeType);
                  const isFlexibleScheme = schemePlan?.paymentMode === 'FLEXIBLE';
                  // Item 4: a FLEXIBLE scheme is payable any number of times within its window
                  // (maturityDate = enrollment + duration, since it never gets pushed out — see
                  // getMaturityDate) rather than capped by a payment count like every other scheme.
                  const canPay = scheme.status === 'Active' && (
                    isFlexibleScheme
                      ? !scheme.maturityDate || new Date() <= new Date(scheme.maturityDate)
                      : realPaymentsCount < scheme.duration
                  );
                  const redemption =
                    scheme.schemeType === 'DIWALI' && scheme.maturityBenefits?.computedAt ? scheme.maturityBenefits : undefined;
                  const awaitingRedemption = scheme.schemeType === 'DIWALI' && scheme.status === 'Completed' && !redemption;
                  return (
                    <Card key={scheme._id} id={`passbook-${scheme._id}`} className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{scheme.planName ?? scheme.schemeType}</p>
                          <p className="text-xs text-muted-foreground">
                            {scheme.passbookNumber ? `Passbook #${scheme.passbookNumber}` : 'Passbook pending first payment'}
                          </p>
                          <p className="font-semibold text-lg mt-0.5">
                            {isFlexibleScheme
                              ? <>Min {formatPrice(scheme.monthlyAmount)}<span className="text-sm font-normal text-muted-foreground"> · pay anytime</span></>
                              : <>{formatPrice(scheme.monthlyAmount)}<span className="text-sm font-normal text-muted-foreground">/mo</span></>}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[scheme.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {scheme.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Duration</span>
                          <span className="font-medium text-foreground">{scheme.duration} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Paid</span>
                          <span className="font-medium text-foreground">{formatPrice(scheme.totalPaid)}</span>
                        </div>
                        {scheme.maturityDate && (
                          <div className="flex justify-between">
                            <span>Matures</span>
                            <span className="font-medium text-foreground">
                              {new Date(scheme.maturityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        {canPay && isFlexibleScheme && (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min={scheme.monthlyAmount}
                              placeholder={`Min ${scheme.monthlyAmount}`}
                              value={flexPayAmounts[scheme._id] ?? ''}
                              onChange={(e) => setFlexPayAmounts((f) => ({ ...f, [scheme._id]: e.target.value }))}
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              className="shrink-0 gap-2"
                              disabled={
                                payingSchemeId === scheme._id ||
                                !flexPayAmounts[scheme._id] ||
                                Number(flexPayAmounts[scheme._id]) < scheme.monthlyAmount
                              }
                              onClick={() => handlePayInstallment(scheme, Number(flexPayAmounts[scheme._id]))}
                            >
                              {payingSchemeId === scheme._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Pay'}
                            </Button>
                          </div>
                        )}
                        {canPay && !isFlexibleScheme && (
                          <Button
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => handlePayInstallment(scheme)}
                            disabled={payingSchemeId === scheme._id}
                          >
                            {payingSchemeId === scheme._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              `Pay This Month (${formatPrice(scheme.monthlyAmount)})`
                            )}
                          </Button>
                        )}
                        {redemption && (
                          <div className="rounded-md bg-accent/10 p-3 text-xs space-y-1">
                            <p className="font-medium text-foreground">Diwali Redemption Ready</p>
                            {!!redemption.goldGrams && (
                              <p>{redemption.goldGrams}g gold ({formatPrice(redemption.goldCoinValue ?? 0)})</p>
                            )}
                            {!!redemption.silverGrams && (
                              <p>{redemption.silverGrams}g silver ({formatPrice(redemption.silverValue ?? 0)})</p>
                            )}
                            {!!redemption.giftsValue && <p>Gift hamper ({formatPrice(redemption.giftsValue)})</p>}
                          </div>
                        )}
                        {awaitingRedemption && (
                          <p className="text-xs text-muted-foreground text-center">
                            All installments collected — your redemption payout will appear here once it's processed.
                          </p>
                        )}
                        {scheme.passbookNumber ? (
                          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setSelectedScheme(scheme)}>
                            <BookOpen className="h-3.5 w-3.5" />
                            View Passbook
                          </Button>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center">
                            Your passbook is issued once your first payment is recorded.
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
            {mySchemes.length > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                You can enroll in additional schemes at any time. Each enrollment is independently tracked with its own passbook number.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Calculator */}
      <section id="calculator" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold text-foreground">
                {selectedPlan ? selectedPlan.name : 'Savings Calculator'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {selectedPlan?.description ?? 'Plan your savings and see how much you can accumulate'}
              </p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input */}
                <div className="space-y-6">
                  {isFlexiblePlan ? (
                    <div>
                      <Label>Payment Amount</Label>
                      <p className="mt-2 text-sm font-medium">
                        Any amount, minimum {formatPrice(selectedPlan?.minPaymentAmount ?? 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        No fixed amount — pay as much as you like, as often as you like, once enrolled.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="amount">Monthly Amount</Label>
                      <Select
                        value={selectedAmount ? String(selectedAmount) : undefined}
                        onValueChange={(v) => setSelectedAmount(Number(v))}
                        disabled={!selectedPlan}
                      >
                        <SelectTrigger className="mt-2" id="amount">
                          <SelectValue placeholder="Select an amount" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {(selectedPlan?.monthlyAmounts ?? []).map((amt) => (
                            <SelectItem key={amt} value={String(amt)}>
                              {formatPrice(amt)} / month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Fixed denominations set by the shop — pick the one that suits you.
                      </p>
                    </div>
                  )}

                  <div>
                    <Label>Scheme Duration</Label>
                    <p className="mt-2 text-sm font-medium">{selectedPlan?.durationMonths ?? '—'} months</p>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-primary text-primary-foreground rounded-xl p-6">
                  <h3 className="font-serif text-xl font-semibold mb-6">Your Savings Summary</h3>
                  {isFlexiblePlan ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="opacity-80">Minimum Payment</span>
                        <span className="font-semibold">{formatPrice(selectedPlan?.minPaymentAmount ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-80">Duration</span>
                        <span className="font-semibold">{selectedPlan?.durationMonths ?? '—'} months</span>
                      </div>
                      <p className="text-sm opacity-90">
                        Pay any amount, as often as you like, within {selectedPlan?.durationMonths ?? 11} months of enrolling —
                        every payment converts to silver grams at that day's rate. Redeemable for silver articles or bars only.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="opacity-80">Monthly Payment</span>
                        <span className="font-semibold">{selectedAmount ? formatPrice(selectedAmount) : '—'}</span>
                      </div>
                      {selectedPlan?.metal && (
                        <div className="flex justify-between text-sm">
                          <span className="opacity-80">≈ Grams at Today's Rate</span>
                          <span className="font-semibold">
                            {estimatedGrams
                              ? `${formatGrams(estimatedGrams)} ${selectedPlan.metal === 'GOLD' ? 'Gold' : 'Silver'}`
                              : 'Rate unavailable'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="opacity-80">Duration</span>
                        <span className="font-semibold">{selectedPlan?.durationMonths ?? '—'} months</span>
                      </div>
                      {summary && (
                        <div className="flex justify-between">
                          <span className="opacity-80">Total Paid</span>
                          <span className="font-semibold">{formatPrice(summary.totalPaid)}</span>
                        </div>
                      )}
                      {summary && summary.bonusAmount > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>Bonus Month Value</span>
                          <span className="font-semibold">+ {formatPrice(summary.bonusAmount)}</span>
                        </div>
                      )}
                      {selectedPlan?.hamper && (
                        <div className="text-sm opacity-90 space-y-1">
                          <p className="opacity-80">Your redemption hamper includes:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li>
                              Gold{selectedPlan.hamper.goldCoinPurity ? ` (${selectedPlan.hamper.goldCoinPurity})` : ''} worth the
                              remaining value — however many grams that buys at redemption
                            </li>
                            {!!selectedPlan.hamper.silverCoinGrams && <li>{selectedPlan.hamper.silverCoinGrams}g Silver Coin</li>}
                            {selectedPlan.hamper.gifts?.map((g, i) => <li key={i}>{g}</li>)}
                          </ul>
                        </div>
                      )}
                      <hr className="border-primary-foreground/20" />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total Value</span>
                        <span className="font-bold">{summary ? formatPrice(summary.totalValue) : '—'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground btn-shine"
                  onClick={handleEnroll}
                  disabled={isEnrolling || isRequestingOtp || !selectedPlan || (!isFlexiblePlan && !selectedAmount)}
                >
                  {isEnrolling ? 'Enrolling...' : isRequestingOtp ? 'Sending code...' : 'Enroll Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  * {selectedPlan?.metal ? `${selectedPlan.metal === 'GOLD' ? 'Gold' : 'Silver'} will be calculated based on the prevailing rate at the time of each payment.` : 'The gold portion of your Diwali hamper is a fixed ₹ value, converted to grams at the rate on the day of redemption — so it stays fair regardless of how gold moves.'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll text a confirmation code to your phone before your enrollment goes through.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground">
              How It Works
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Choose', desc: 'Pick the Gold Purchase Plan, Silver Purchase Plan, or the Diwali scheme and a monthly amount' },
                { step: '02', title: 'Save', desc: 'Pay your installments monthly via Razorpay, or in cash at the shop' },
                { step: '03', title: 'Earn', desc: 'The Gold and Silver Purchase Plans get a bonus month; the Diwali scheme gets a festival hamper' },
                { step: '04', title: 'Redeem', desc: 'Exchange your accumulated value for jewellery, coins, or the hamper — goods only, never cash' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-accent text-accent-foreground flex items-center justify-center font-serif text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'What monthly amounts can I choose?',
                  a: 'Each scheme publishes a fixed set of monthly amounts — pick the one that suits you when enrolling. Amounts can\'t be changed mid-scheme.',
                },
                {
                  q: 'What happens if I miss a payment?',
                  a: 'You can pay the next month, but your maturity date moves out by however many months you fell behind. Only one installment is accepted per calendar month.',
                },
                {
                  q: 'What if I need to stop the scheme early?',
                  a: 'You can exit any time before completing the scheme, but 10% of what you\'ve paid is forfeited (plus the value of any gifts already received), and the remainder is redeemable as goods only — never as a cash refund.',
                },
                {
                  q: 'How is the bonus calculated?',
                  a: 'The Gold Purchase Plan and Silver Purchase Plan credit one bonus month\'s value (in grams, at that day\'s rate) automatically once you complete all 11 real installments. The Diwali scheme has no bonus month — instead you receive the fixed festival hamper.',
                },
                {
                  q: 'Can I pay in cash instead of online?',
                  a: 'Yes — visit the shop and our staff can record a cash collection on your passbook directly.',
                },
              ].map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Passbook viewer (own schemes, or looked up by passbook number) */}
      <Dialog open={!!selectedScheme} onOpenChange={(open) => !open && setSelectedScheme(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <span>Savings Passbook</span>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handlePrintPassbook()}>
                <Printer className="h-3.5 w-3.5" />
                Export / Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedScheme && (
            <PassbookView
              ref={passbookRef}
              scheme={selectedScheme}
              userName={user?.name}
              userPhone={user?.phone}
              userAddress={userAddressLine}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Item 2 (replaced 2026-09-16, was KYC): confirm enrollment with the OTP just sent. */}
      <Dialog open={showOtpForm} onOpenChange={setShowOtpForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Confirm Your Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              {otpChannel === 'email'
                ? "We've emailed you a confirmation code — enter it below to complete your enrollment."
                : "We've sent a confirmation code to your WhatsApp — enter it below to complete your enrollment."}
            </p>
            <div>
              <Label htmlFor="enrollOtp">Confirmation Code</Label>
              <Input
                id="enrollOtp"
                inputMode="numeric"
                autoFocus
                value={enrollOtp}
                onChange={(e) => setEnrollOtp(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button className="w-full btn-shine" onClick={handleConfirmEnrollOtp} disabled={isEnrolling || !enrollOtp.trim()}>
              {isEnrolling ? 'Enrolling...' : 'Confirm & Enroll'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingsScheme;
