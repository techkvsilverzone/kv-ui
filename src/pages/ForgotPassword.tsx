import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth';

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      toast({
        title: 'Reset link sent!',
        description: 'Check your email for password reset instructions.',
      });
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: 'Request failed',
        description: error.message || 'Unable to send reset link right now.',
        variant: 'destructive',
      });
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
                {isSubmitted
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive reset instructions'}
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
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try a different email
                </Button>
              </div>
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
