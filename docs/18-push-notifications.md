# Push Notifications (Android / FCM)

The customer mobile app supports push via Capacitor's
[`@capacitor/push-notifications`](https://capacitorjs.com/docs/apis/push-notifications)
plugin, backed by **Firebase Cloud Messaging (FCM)** on Android.

Client wiring lives in:
- [`src/components/PushNotifications.tsx`](../src/components/PushNotifications.tsx) — requests permission, registers the device, handles foreground delivery (toast) and tap deep-links. No-ops on web. Mounted in `App.tsx` inside the auth + router providers, so it only registers once a user is logged in.
- [`src/services/push.ts`](../src/services/push.ts) — sends the device token to the backend.

Registration only runs on the **native build** (`isMobileApp()`) and **after login** (the token is stored against the user so the backend can target them).

---

## 1. Firebase setup (one-time, required)

Without this the app still builds and runs — push just silently fails
(`registrationError`). The Gradle side is already wired: it applies the
`com.google.gms.google-services` plugin **only when `google-services.json` is
present** (`android/app/build.gradle`).

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add an **Android app** with package name **`com.kvsilverzone.app`** (must match `capacitor.config.ts` `appId`).
3. Download **`google-services.json`** and place it at **`android/app/google-services.json`**.
   - It is gitignored by default — distribute it to other devs out-of-band, or commit it per your team's policy (it contains no server secret).
4. Rebuild: `npm run mobile:sync` then run from Android Studio.

> iOS later: also requires an APNs key uploaded to Firebase + a `GoogleService-Info.plist`.

## 2. Sending a notification

The backend sends to FCM using a **service account** (Firebase Admin SDK) or
the legacy server key. To deep-link on tap, include a `route` in the data
payload — the client calls `navigate(route)`:

```json
{
  "notification": { "title": "Order shipped", "body": "Your order #1234 is on its way" },
  "data": { "route": "/order/1234" }
}
```

For a quick manual test, use the Firebase Console → Cloud Messaging → "Send test
message" and paste a device token (logged by the `registration` listener).

---

## 3. Backend contract (REQUIRED — not yet implemented)

The app expects these endpoints (Bearer-authenticated on mobile):

| Method | Path | Body | Purpose |
|---|---|---|---|
| `POST` | `/users/me/push-tokens` | `{ token, platform }` | Store/refresh the device token for the user |
| `DELETE` | `/users/me/push-tokens` | `{ token }` | Remove a token (e.g. on sign-out from another device) |

- `platform` is `"android"` (later `"ios"`/`"web"`).
- Store tokens **per user, deduped by token value**; a token can move between
  users (re-login on a shared device) — last writer wins.
- Prune tokens FCM reports as unregistered/invalid when sending.
- The backend must hold Firebase credentials (service account JSON) to send.

> Note: the client does **not** auto-unregister on logout (the DELETE would be
> unauthenticated once the token is cleared). Rely on backend dedupe + FCM
> invalid-token pruning, or add an explicit "sign out everywhere" flow.
