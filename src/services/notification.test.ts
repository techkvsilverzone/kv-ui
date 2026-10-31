import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notificationService } from './notification';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists the signed-in user notifications', async () => {
    const list = { notifications: [{ _id: 'n1', kind: 'order', title: 'Shipped', body: 'On its way', route: '/order/1', read: false, createdAt: '2026-10-31T00:00:00Z' }], unreadCount: 1 };
    vi.mocked(api.get).mockResolvedValue(list);

    await expect(notificationService.list()).resolves.toEqual(list);
    expect(api.get).toHaveBeenCalledWith('/users/me/notifications');
  });

  it('marks one or all notifications as read', async () => {
    vi.mocked(api.post).mockResolvedValue({});

    await notificationService.markRead('n1');
    await notificationService.markAllRead();

    expect(api.post).toHaveBeenNthCalledWith(1, '/users/me/notifications/n1/read', {});
    expect(api.post).toHaveBeenNthCalledWith(2, '/users/me/notifications/read-all', {});
  });
});
