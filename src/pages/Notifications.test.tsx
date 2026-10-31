import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Notifications from './Notifications';
import { notificationService } from '@/services/notification';

vi.mock('@/services/notification', () => ({
  notificationService: { list: vi.fn(), markRead: vi.fn(), markAllRead: vi.fn() },
}));

const renderPage = () =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/notifications']}>
          <Routes>
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/order/:id" element={<p>Order page</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

describe('Notifications page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(notificationService.markRead).mockResolvedValue();
    vi.mocked(notificationService.markAllRead).mockResolvedValue();
  });

  it('shows an empty state', async () => {
    vi.mocked(notificationService.list).mockResolvedValue({ notifications: [], unreadCount: 0 });
    renderPage();
    expect(await screen.findByText(/no notifications yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark all as read/i })).not.toBeInTheDocument();
  });

  it('marks a tapped notification read and opens its route', async () => {
    vi.mocked(notificationService.list).mockResolvedValue({
      notifications: [
        { _id: 'n1', kind: 'order', title: 'Order shipped', body: 'Your order is on its way', route: '/order/42', read: false, createdAt: new Date().toISOString() },
        { _id: 'n2', kind: 'general', title: 'Welcome', body: 'Thanks for joining', route: null, read: true, createdAt: '2026-01-05T10:00:00Z' },
      ],
      unreadCount: 1,
    });
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /mark all as read/i }));
    await waitFor(() => expect(notificationService.markAllRead).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Order shipped'));
    expect(await screen.findByText('Order page')).toBeInTheDocument();
    expect(vi.mocked(notificationService.markRead).mock.calls[0][0]).toBe('n1');
  });
});
