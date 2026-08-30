import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Mail, Lock, User, Store, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import type { PhoneVerificationDispatch } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';
import { validateForm, signupSchema } from '@/lib/validation';
import { stallConfigService, DEFAULT_STALL_CONFIG } from '@/services/stallConfig';
import Seo from '@/components/Seo';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, requestPhoneVerification, verifyPhoneOtp } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Item 1: post-signup mobile verification dialog.
  const [phoneVerification, setPhoneVerification] = useState<PhoneVerificationDispatch | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Offline stall mode: the link (?stall=1) marks this as a stall registration,
  // but it only actually applies while the admin toggle is server-side active —
  // this can't be spoofed by a customer just adding the query param themselves.
  const { data: stallConfig = DEFAULT_STALL_CONFIG } = useQuery({
    queryKey: ['stall-config'],
    queryFn: stallConfigService.getStallConfig,
    staleTime: 60_000,
  });
  const offlineStallActive = searchParams.get('stall') === '1' && stallConfig.active;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateForm(signupSchema, { ...formData, acceptTerms });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const { success, promoCoupon, phoneVerification: dispatch } = await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        offlineStallActive,
      );
      if (success) {
        if (promoCoupon) {
          toast({
            title: 'Welcome! Promo coupon applied 🎉',
            description: `Use code ${promoCoupon} for 10% off your first order.`,
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to KV Silver Zone.',
          });
        }
        // Hold on this page for the mobile-verification step rather than navigating away
        // immediately — the customer already has a session either way, so this never blocks
        // them from using the site if they close the dialog without verifying.
        if (dispatch) {
          setPhoneVerification(dispatch);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode.trim().length !== 6) return;
    setIsVerifying(true);
    try {
      const ok = await verifyPhoneOtp(verifyCode.trim());
      if (ok) {
        toast({ title: 'Phone verified', description: 'Your mobile number is now verified.' });
        navigate('/');
      } else {
        toast({ title: 'Incorrect code', description: 'Please check the code and try again.', variant: 'destructive' });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const dispatch = await requestPhoneVerification();
      if (dispatch) {
        setPhoneVerification(dispatch);
        toast({ title: 'Code resent', description: dispatch.message });
      } else {
        toast({ title: 'Could not resend code', description: 'Please try again shortly.', variant: 'destructive' });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-muted/30">
      <Seo title="Create Account" noindex />
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            {offlineStallActive && (
              <div className="flex items-start gap-3 bg-accent/20 border border-accent/40 rounded-lg px-4 py-3 mb-6">
                <Store className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Stall Event Offer!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Register now and receive a free promotional coupon automatically credited to your account.
                  </p>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-serif font-bold text-2xl">KV</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground mt-2">
                Join KV Silver Zone for exclusive offers
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="pl-10"
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="pl-10"
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d]/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="pl-10"
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                <p className="text-xs text-muted-foreground mt-1">We'll send a verification code here after you sign up.</p>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10"
                    aria-invalid={!!errors.confirmPassword}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the{' '}
                  <Link to="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && <p className="text-xs text-destructive -mt-3">{errors.acceptTerms}</p>}

              <Button type="submit" className="w-full btn-shine" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Item 1: mobile verification, shown right after a successful signup. */}
      <Dialog open={phoneVerification !== null} onOpenChange={(open) => { if (!open) navigate('/'); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Verify Your Phone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVerifyPhone} className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              {phoneVerification?.channel === 'email'
                ? `WhatsApp verification isn't active yet, so we emailed a code to ${formData.email}.`
                : `We sent a 6-digit code to your WhatsApp at +91 ${formData.phone}.`}
            </p>
            <div>
              <Label htmlFor="verifyCode">Verification Code</Label>
              <Input
                id="verifyCode"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="mt-1 text-center text-lg tracking-[0.3em]"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full btn-shine" disabled={isVerifying || verifyCode.length !== 6}>
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Resend code'}
              </button>
              <button type="button" onClick={() => navigate('/')} className="text-muted-foreground hover:underline">
                Skip for now
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
