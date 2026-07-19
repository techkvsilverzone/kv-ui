import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { validateForm, loginSchema } from '@/lib/validation';
import { authService } from '@/services/auth';
import Seo from '@/components/Seo';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/';
  const { login, loginWithOtp } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // OTP mode state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateForm(loginSchema, formData);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        navigate(redirectTo, { replace: true });
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password.',
          variant: 'destructive',
        });
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

  const handleSendOtp = async () => {
    if (!otpEmail.trim()) {
      toast({ title: 'Email required', description: 'Enter your email to receive a code.', variant: 'destructive' });
      return;
    }
    setIsSendingOtp(true);
    try {
      await authService.requestOtp(otpEmail.trim());
      setOtpSent(true);
      toast({ title: 'Code sent', description: `Check ${otpEmail} for your login code.` });
    } catch {
      toast({ title: 'Error', description: 'Could not send the code. Please try again.', variant: 'destructive' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setIsLoading(true);
    try {
      const success = await loginWithOtp(otpEmail.trim(), otpCode.trim());
      if (success) {
        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
        navigate(redirectTo, { replace: true });
      } else {
        toast({ title: 'Invalid code', description: 'That code is incorrect or has expired.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-muted/30">
      <Seo title="Sign In" noindex />
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-serif font-bold text-2xl">KV</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground mt-2">
                Sign in to your KV Silver Zone account
              </p>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'password' | 'otp')} className="mb-6">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">OTP Login</TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === 'password' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
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

                <Button type="submit" className="w-full btn-shine" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <Label htmlFor="otpEmail">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="otpEmail"
                      type="email"
                      value={otpEmail}
                      onChange={(e) => {
                        setOtpEmail(e.target.value);
                        setOtpSent(false);
                      }}
                      placeholder="your@email.com"
                      className="pl-10"
                      disabled={otpSent}
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <Button
                    type="button"
                    className="w-full btn-shine"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || !otpEmail.trim()}
                  >
                    {isSendingOtp ? 'Sending code...' : 'Send Login Code'}
                  </Button>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="otpCode">Login Code</Label>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="text-sm text-primary hover:underline"
                        >
                          Resend code
                        </button>
                      </div>
                      <div className="relative mt-1">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="otpCode"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit code"
                          className="pl-10 tracking-widest"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Sent to {otpEmail}</p>
                    </div>
                    <Button type="submit" className="w-full btn-shine" disabled={isLoading || otpCode.length !== 6}>
                      {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                    </Button>
                  </>
                )}
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>            
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
