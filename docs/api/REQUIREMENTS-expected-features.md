# API requirements — expected features needing backend work

> **Status (2026-06-14): backend implemented ✅ — frontend now wired.**
> Both endpoints below exist in `openapi.json` and are integrated client-side:
> - Order confirmation email: sent on order creation; resend via `POST /orders/{id}/resend-confirmation`
>   → wired to a "Resend email" action on the order confirmation page.
> - Address book: `GET/POST/PUT/DELETE /users/me/addresses` → `src/services/address.ts`, with a
>   saved-address picker + prefill at checkout and account-bound save on order. See
>   [addresses.md](addresses.md).
> The original requirements are kept below for reference.

These are the **backend/API requirements** for the "expected features" list. The frontend pieces are
done (see `../../API_CHANGES_AND_FIXES.md`); the items below cannot be completed client-side alone.

---

## 1. Order confirmation email  (REQUIRED — not yet available)

**Why:** After checkout the customer should receive an email confirmation with the order summary and
invoice. There is no email today. The frontend cannot send transactional email; this is server-side.

**Recommended: send automatically on order creation** (no frontend change needed)
- When an order is persisted (in `POST /payments/verify` for both `razorpay` and `cod`), the server
  sends a confirmation email to the customer's account email.
- Email should include: order id, line items, totals (subtotal, tax, delivery, grand total),
  shipping address, and ideally a PDF invoice or a link to the order page (`/order/:id`).

**Optional: a resend endpoint** (enables a "Resend confirmation" button in the UI)
```
POST /orders/{id}/resend-confirmation
Auth: cookie (owner or admin)
Response: { "success": true, "message": "Confirmation email sent" }
```
- If provided, the frontend can add a "Resend confirmation email" action on the order page.
- Idempotent / rate-limited server-side to avoid abuse.

**Notes**
- The client already offers a **downloadable invoice** (react-to-print) on the order pages, so the
  email is the only missing half of "order confirmation email / invoice".
- Bounce/error handling is server-side; the client does not need delivery status.

---

## 2. Server-side saved address book  (OPTIONAL — enhancement)

**Current state:** the checkout address is saved in `localStorage` (`kv-silver-address`) and prefilled
on the next checkout. This is device-local and lost on a new device / cleared storage.

**To make it account-bound** (synced across devices), expose CRUD on the user's addresses:
```
GET    /users/me/addresses            -> [{ id, label?, firstName, lastName, address, city, state, pincode, phone, isDefault }]
POST   /users/me/addresses            body: <address>            -> created address
PUT    /users/me/addresses/{id}       body: <address>            -> updated address
DELETE /users/me/addresses/{id}                                  -> 204
```
- Frontend would replace the localStorage prefill with a saved-address picker at checkout and an
  address manager under Profile.
- Until this exists, the localStorage version stays as the fallback (no regression).

---

## 3. Already covered by existing endpoints (no new API needed)

| Expected feature | How it's served | Endpoint(s) |
|------------------|-----------------|-------------|
| Downloadable invoice | client-side print of order data | `GET /orders/me`, `GET /orders/{id}` |
| Out-of-stock at checkout | `stockAvailable`/`inStock` on products | `GET /products`, `GET /products/{id}` |
| SEO / analytics / a11y | fully client-side | — |
| Saved address (device-local) | localStorage | — |

---

_Last updated: 2026-06-14. Items 1–2 are backend asks; everything else is implemented client-side._
