import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth';

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const sendCode = async () => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast({
        title: 'Reset code sent!',
        description: 'Check your email for a 6-digit code.',
      });
      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: 'Request failed',
        description: errorMessage(error, 'Unable to send a reset code right now.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendCode();
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    setResetError('');
    setIsLoading(true);
    try {
      await authService.resetPassword(email, code, newPassword);
      toast({ title: 'Password reset', description: 'Sign in with your new password.' });
      navigate('/login');
    } catch (error) {
      setResetError(errorMessage(error, 'Unable to reset your password right now.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-serif font-bold text-2xl">KV</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground mt-2">
                {isSubmitted ? (
                  <>
                    Enter the 6-digit code we emailed to <strong>{email}</strong>
                  </>
                ) : (
                  "Enter your email and we'll send you a 6-digit reset code"
                )}
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full btn-shine" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="code">Reset Code</Label>
                    <button
                      type="button"
                      onClick={() => void sendCode()}
                      disabled={isLoading}
                      className="text-sm text-primary hover:underline"
                    >
                      Resend code
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit code"
                      className="pl-10 tracking-widest"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {resetError && <p className="text-sm text-destructive" role="alert">{resetError}</p>}

                <Button type="submit" className="w-full btn-shine" disabled={isLoading || code.length !== 6}>
                  {isLoading ? 'Please wait...' : 'Reset Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setCode('');
                    setResetError('');
                  }}
                >
                  Try a different email
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
