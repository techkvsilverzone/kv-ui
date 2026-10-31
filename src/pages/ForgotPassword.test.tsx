import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { authService } from '@/services/auth';

const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
vi.mock('@/services/auth', () => ({
  authService: { forgotPassword: vi.fn(), resetPassword: vi.fn() },
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const requestCode = async () => {
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'asha@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /send reset code/i }));
  await screen.findByLabelText(/reset code/i);
};

const fillReset = (code: string, password: string, confirm: string) => {
  fireEvent.change(screen.getByLabelText(/reset code/i), { target: { value: code } });
  fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: /^reset password$/i }));
};

describe('ForgotPassword page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'sent' });
  });

  it('emails a code, then resets the password and returns to login', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({});
    renderPage();
    await requestCode();
    expect(authService.forgotPassword).toHaveBeenCalledWith('asha@example.com');

    fillReset('123456', 'secret1', 'secret1');

    await screen.findByText('Login page');
    expect(authService.resetPassword).toHaveBeenCalledWith('asha@example.com', '123456', 'secret1');
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Password reset' }));
  });

  it('validates length and match before calling the API', async () => {
    renderPage();
    await requestCode();

    fillReset('123456', 'abc', 'abc');
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 6 characters/i);

    fillReset('123456', 'secret1', 'secret2');
    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/i);
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('shows the server error and can resend the code', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(new Error('Incorrect code.'));
    renderPage();
    await requestCode();

    fillReset('000000', 'secret1', 'secret1');
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect code.');

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));
    await waitFor(() => expect(authService.forgotPassword).toHaveBeenCalledTimes(2));
  });
});
