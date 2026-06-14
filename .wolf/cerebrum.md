# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-03

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->
- [2026-06-14] When fixing pre-delivery issues, the user prefers doing the frontend-only/safe items first and deferring backend-coupled money paths (payment payload changes) until the backend can change in lockstep. Document required backend changes in `API_CHANGES_AND_FIXES.md` rather than risking a broken checkout.

## Key Learnings

- **Project:** kv-silver-zone
- **Description:** Premium Silver selling eCommerce Platform
- Form validation uses zod schemas in `src/lib/validation.ts` + a `validateForm(schema, data)` helper returning `{ success, errors }` (flat field->message map). Forms keep raw `useState`, validate on submit, render inline `text-destructive` errors with `aria-invalid`. Indian phone rule: `^[6-9]\d{9}$` (tolerant of +91/spaces); PIN `^\d{6}$`.
- Protected routes are wrapped with `src/components/RequireAuth.tsx` in `App.tsx` (redirects to `/login` with `state.from`; Login returns the user there). `ErrorBoundary.tsx` wraps the route tree for render-error fallback.
- ProductDetail price breakdown prefers the server-computed `product.pricing` (`metalValue`, `makingCharge`, `ratePerGram`, `basis`) + `weightInGrams`; falls back to live `silverRateService.getTodayRate()` × weight, then a 75/25 split — display only; server stays authoritative for the charge.
- Auth is cookie-based (httpOnly): `api.ts` sends `credentials: 'include'` and sets NO `Authorization` header / no `kv-silver-token` in localStorage. Logout must call `POST /auth/logout` (JS can't clear an httpOnly cookie). Login/signup ignore the response `token`. Only the user object is cached in `localStorage` (`kv-silver-user`).
- GST percent is read from `GET /pricing-config` via `src/services/pricingConfig.ts` (default 3%) — used in `CartContext`, `Payment`, `ProductDetail`. Do NOT hardcode GST (Payment previously used 5% while Cart used 3%).
- Gift vouchers come from `GET /gift-vouchers` (`src/services/giftVoucher.ts`). Voucher cart items must carry `isGiftVoucher: true` + `giftVoucherId`; these flow into create-order and verify line items so the server prices them.
- Checkout: `POST /payments/create-order` takes `{ items:[{product,quantity,isGiftVoucher?,giftVoucherId?}], couponCode?, pincode? }` (NO client amount) and returns the authoritative `{ id, amount, currency, breakdown? }`. Never send a client-computed total as authoritative.
- SEO uses `react-helmet-async`: `<HelmetProvider>` wraps the tree in `App.tsx`; per-page `<Seo title description image? type? noindex?>` from `src/components/Seo.tsx`. IMPORTANT: any test that renders a page using `<Seo>` must wrap render in `<HelmetProvider>` or Helmet throws "Cannot read properties of undefined (reading 'add')".
- Per-endpoint frontend↔API contracts live in `docs/api/` (one md per endpoint) — update them when a request/response shape changes.
- Saved checkout address: `Payment.tsx` persists/loads the shipping address in `localStorage` under `kv-silver-address` (separate from `kv-silver-user`/`kv-silver-cart`).
- **`openapi.json` at repo root is the source of truth for API shapes** — consult it before assuming response fields. Several list/config endpoints wrap payloads in `{ status, data }` (e.g. `/gift-vouchers`, `/pricing-config`, `/products/categories`) while `/products`, `/products/{id}`, `/products/featured` return bare. GiftVoucher uses `label`+`amount`+`sortOrder`; `ProductPricing.basis` is enum `'live'|'static'`.
- Analytics/monitoring in `src/lib/analytics.ts` — `@sentry/react` + GA4, gated on `VITE_SENTRY_DSN`/`VITE_GA4_ID`, no-op when blank. `initMonitoring()` in `main.tsx`; SPA page views via `trackPageview` in `AppContent` on route change.
- Invoice download: `react-to-print` v3 `useReactToPrint({ contentRef })` in `OrderTracking.tsx`, printing the off-screen `InvoiceView` (forwardRef).
- E2E: Playwright config at root, tests in `e2e/` (vitest `include` is `src/**` so no collision). `npm run test:e2e`; first run needs `npx playwright install chromium`.
- Address book: `src/services/address.ts` (`/users/me/addresses` CRUD, bare array; `Address` has `label`/`isDefault`; `AddressInput` omits `id`). `Payment.tsx` shows a saved-address picker for authed users, prefills the default, and POSTs a new address on order success (dedup by address+pincode+phone); guests still use `localStorage` `kv-silver-address`. Order confirmation email is automatic server-side; `orderService.resendConfirmation(id)` (`POST /orders/{id}/resend-confirmation`) powers the "Resend email" button on `OrderConfirmation.tsx`.
- Password changes use `PUT /users/:userId/password` with body `{ newPassword }`, and UI should map status codes 400/403/404 to user-facing validation messages.
- Admin user-management actions can be role-gated inside `src/pages/Admin.tsx` using `role === 'admin'`, while staff may still access other admin tabs.
- Storefront theme should be fetched from public `GET /store-config` on app startup, with localStorage only as fallback.
- Admin theme management should read from `GET /admin/store-config` and update through `/admin/store-config` (PUT with POST fallback for compatibility).

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->
- [2026-06-14] A `validateForm` helper typed as a discriminated union `{success:true;data} | {success:false;errors}` failed TS narrowing under `if (!result.success)` at call sites (TS2339 on `.errors`). Fixed by returning a single shape `{ success: boolean; errors: Record<string,string> }` (errors empty when valid). Forms read `formData` directly, so the parsed `data` wasn't needed.
- [2026-06-14] Bug-029: `Shop.tsx handleSearchChange` called `setSelectedPriceRanges([])` (plural) — setter is `setSelectedPriceRange('')` (singular string). Typing in search threw ReferenceError. Verify setter names match useState declarations.
- [2026-06-14] Adding `<Seo>` (react-helmet-async) to a page broke `Shop.test.tsx` with "Cannot read properties of undefined (reading 'add')" because the test render had no `<HelmetProvider>`. Fix: wrap page-render test helpers in `<HelmetProvider>`. Applies to any future test rendering a page that uses `<Seo>`.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
- [2026-04-05] Implemented a dedicated `ChangePassword` page for normal users and a separate admin-only modal action in the customers table, both hitting the same endpoint for consistent backend behavior.
- [2026-04-05] Switched theme persistence to backend store-config endpoints for both public app initialization and admin save flow.
