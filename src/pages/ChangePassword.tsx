import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth';
import { ApiError } from '@/lib/api';

const getPasswordErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      return 'Password is weak or invalid. Please use a stronger password.';
    }
    if (error.statusCode === 403) {
      return 'You are not allowed to change another user\'s password.';
    }
    if (error.statusCode === 404) {
      return 'User not found.';
    }
    return error.message || 'Failed to change password.';
  }

  return 'Failed to change password. Please try again.';
};

const ChangePassword = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const userId = user?.id || user?._id;

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: 'Unable to change password',
        description: 'User id is missing. Please login again.',
        variant: 'destructive',
      });
      return;
    }

    if (!newPassword.trim()) {
      toast({
        title: 'Password required',
        description: 'Please enter a new password.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Confirm password must match the new password.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword(userId, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Change password failed',
        description: getPasswordErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-xl">
        <Card className="p-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Change Password</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Update your account password securely.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                placeholder="Confirm new password"
              />
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full btn-shine">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
