import { api } from '../lib/api';

export type PushPlatform = 'android' | 'ios' | 'web';

export interface RegisterPushTokenPayload {
  /** The FCM (Android) / APNs (iOS) registration token from the device. */
  token: string;
  platform: PushPlatform;
}

/**
 * Device push-token registration. The backend stores tokens against the
 * authenticated user (Bearer auth on mobile) so it can target the device via
 * FCM/APNs. See docs/push-notifications.md for the expected backend contract.
 */
export const pushService = {
  register: async (payload: RegisterPushTokenPayload): Promise<void> => {
    return api.post<void>('/users/me/push-tokens', payload);
  },

  unregister: async (token: string): Promise<void> => {
    // DELETE with a body — api.delete forwards RequestInit options.
    return api.delete<void>('/users/me/push-tokens', {
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
