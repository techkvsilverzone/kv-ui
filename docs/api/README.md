# Frontend ↔ API contracts

One file per endpoint the **storefront client now depends on** after the round-2 integration
(2026-06-14). These are not new endpoints — they document the exact request/response shapes the
client sends and reads, so the backend can verify field names line up.

Each doc has a **"Confirm these fields"** section — the client parses these defensively (safe
fallbacks, no crash on mismatch), but live data only renders correctly if the names match.

| Change | Doc | Client files |
|--------|-----|--------------|
| Cookie auth + logout | [auth-cookie.md](auth-cookie.md) | `src/lib/api.ts`, `src/context/AuthContext.tsx`, `src/services/auth.ts` |
| Create Razorpay order | [payments-create-order.md](payments-create-order.md) | `src/services/payment.ts`, `src/pages/Payment.tsx` |
| Verify payment | [payments-verify.md](payments-verify.md) | `src/services/payment.ts`, `src/pages/Payment.tsx` |
| Gift vouchers | [gift-vouchers.md](gift-vouchers.md) | `src/services/giftVoucher.ts`, `src/pages/GiftVouchers.tsx` |
| Pricing config (GST) | [pricing-config.md](pricing-config.md) | `src/services/pricingConfig.ts` |
| Product pricing & stock | [products-pricing-stock.md](products-pricing-stock.md) | `src/services/product.ts`, `src/pages/ProductDetail.tsx`, `src/components/ProductCard.tsx` |
| Address book + resend email | [addresses.md](addresses.md) | `src/services/address.ts`, `src/services/order.ts`, `src/pages/Payment.tsx`, `src/pages/OrderConfirmation.tsx` |

## Pending backend requirements

Features whose frontend is done but which need backend work to complete:
[REQUIREMENTS-expected-features.md](REQUIREMENTS-expected-features.md) — order confirmation email
(required) and optional server-side address book.
