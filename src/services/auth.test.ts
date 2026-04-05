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

  it('signup posts payload including optional phone', async () => {
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

  it('changes password with user specific endpoint', async () => {
    const response = { message: 'Password updated' };
    vi.mocked(api.put).mockResolvedValue(response);

    const result = await authService.changePassword('u1', 'new-secret');

    expect(api.put).toHaveBeenCalledWith('/users/u1/password', { newPassword: 'new-secret' });
    expect(result).toEqual(response);
  });
});
