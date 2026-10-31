import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from './auth';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login posts credentials to auth endpoint', async () => {
    const response = { user: { id: 'u1', email: 'a@b.com', name: 'A', isAdmin: false }, token: 'tok' };
    vi.mocked(api.post).mockResolvedValue(response);

    const result = await authService.login('a@b.com', 'secret');

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'secret' });
    expect(result).toEqual(response);
  });

  it('signup posts payload including phone', async () => {
    const response = { user: { id: 'u1', email: 'a@b.com', name: 'A', isAdmin: false }, token: 'tok' };
    vi.mocked(api.post).mockResolvedValue(response);

    await authService.signup('A', 'a@b.com', 'secret', '+911234567890');

    expect(api.post).toHaveBeenCalledWith('/auth/signup', {
      name: 'A',
      email: 'a@b.com',
      password: 'secret',
      phone: '+911234567890',
    });
  });

  it('gets and updates profile', async () => {
    const user = { id: 'u1', email: 'a@b.com', name: 'A', isAdmin: false };
    vi.mocked(api.get).mockResolvedValue(user);
    vi.mocked(api.put).mockResolvedValue({ ...user, name: 'B' });

    const me = await authService.getMe();
    const updated = await authService.updateProfile({ name: 'B' });

    expect(api.get).toHaveBeenCalledWith('/users/me');
    expect(api.put).toHaveBeenCalledWith('/users/me', { name: 'B' });
    expect(me).toEqual(user);
    expect(updated).toEqual({ ...user, name: 'B' });
  });

  it('requests and verifies login OTP by mobile number (primary login method)', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ message: 'sent' });
    const response = { user: { id: 'u1', email: 'a@b.com', name: 'A', isAdmin: false }, token: 'tok' };
    vi.mocked(api.post).mockResolvedValueOnce(response);

    await authService.requestOtp('9876543210');
    const result = await authService.verifyOtp('9876543210', '123456');

    expect(api.post).toHaveBeenNthCalledWith(1, '/auth/otp/request', { phone: '9876543210' });
    expect(api.post).toHaveBeenNthCalledWith(2, '/auth/otp/verify', { phone: '9876543210', code: '123456' });
    expect(result).toEqual(response);
  });

  it('changes password with user specific endpoint', async () => {
    const response = { message: 'Password updated' };
    vi.mocked(api.put).mockResolvedValue(response);

    const result = await authService.changePassword('u1', 'new-secret');

    expect(api.put).toHaveBeenCalledWith('/users/u1/password', { newPassword: 'new-secret' });
    expect(result).toEqual(response);
  });

  it('requests a reset code and redeems it with the new password', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok' });

    await authService.forgotPassword('a@b.com');
    await authService.resetPassword('a@b.com', '123456', 'secret1');

    expect(api.post).toHaveBeenNthCalledWith(1, '/auth/forgot-password', { email: 'a@b.com' });
    expect(api.post).toHaveBeenNthCalledWith(2, '/auth/reset-password', { email: 'a@b.com', code: '123456', newPassword: 'secret1' });
  });
});
