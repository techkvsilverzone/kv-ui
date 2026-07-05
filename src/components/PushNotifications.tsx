import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isMobileApp } from '@/lib/platform';
import { pushService } from '@/services/push';

/**
 * Wires Capacitor push notifications (FCM on Android). Renders nothing.
 *
 * Mounted inside the auth + router providers so it can register the device
 * token against the logged-in user and navigate when a notification is tapped.
 * No-ops entirely on the web build / non-native runtime. The plugin is loaded
 * via dynamic import so it never enters the web bundle.
 *
 * Requires Firebase setup on the Android project — see docs/push-notifications.md.
 */
const PushNotifications = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialized = useRef(false);

  useEffect(() => {
    // Only register once we have an authenticated user (the backend stores the
    // token against that user) and only on the native mobile app.
    if (!isMobileApp() || !isAuthenticated || initialized.current) return;
    initialized.current = true;

    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { PushNotifications: Push } = await import('@capacitor/push-notifications');

        // Ask for permission (Android 13+ prompts the user at runtime).
        let perm = await Push.checkPermissions();
        if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
          perm = await Push.requestPermissions();
        }
        if (perm.receive !== 'granted') {
          initialized.current = false; // allow a retry on next auth change
          return;
        }

        // Send the FCM token to the backend so it can target this device.
        const registrationListener = await Push.addListener('registration', (token) => {
          void pushService
            .register({ token: token.value, platform: 'android' })
            .catch((err) => console.error('Push token registration failed', err));
        });

        const registrationErrorListener = await Push.addListener('registrationError', (err) => {
          console.error('Push registration error', err);
        });

        // Foreground delivery — surface it as an in-app toast.
        const receivedListener = await Push.addListener('pushNotificationReceived', (notification) => {
          toast({
            title: notification.title ?? 'Notification',
            description: notification.body ?? undefined,
          });
        });

        // User tapped the notification — deep-link if the payload carries a route.
        const actionListener = await Push.addListener('pushNotificationActionPerformed', (action) => {
          const route = action.notification.data?.route as string | undefined;
          if (route) navigate(route);
        });

        // Trigger the OS registration flow (fires the `registration` listener).
        await Push.register();

        cleanup = () => {
          void registrationListener.remove();
          void registrationErrorListener.remove();
          void receivedListener.remove();
          void actionListener.remove();
        };
      } catch (err) {
        console.error('Push notifications init failed', err);
        initialized.current = false;
      }
    })();

    return () => {
      cleanup?.();
    };
  }, [isAuthenticated, navigate, toast]);

  return null;
};

export default PushNotifications;
