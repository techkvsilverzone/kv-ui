# Documentation Index

All project docs in one place, **numbered oldest → newest** so you can read them in the order the
work happened. `01` is the earliest; the highest number is the most recent.

> `CLAUDE.md` (root), `.claude/`, and `.wolf/` are AI-tooling files and are intentionally left in
> place — they are not part of this numbered set. `README.md` stays at the project root.

## Chronological order

| # | Doc | What it covers |
|---|-----|----------------|
| 01 | [01-api-definition.md](01-api-definition.md) | Original API definition |
| 02 | [02-api-changes.md](02-api-changes.md) | Early API changes |
| 03 | [03-admin-panel-fixes-plan.md](03-admin-panel-fixes-plan.md) | Admin panel fixes plan |
| 04 | [04-api-changes-plan.md](04-api-changes-plan.md) | API changes plan |
| 05 | [05-page-implementation-plan.md](05-page-implementation-plan.md) | Page implementation plan |
| 06 | [06-saas-feature-plan.md](06-saas-feature-plan.md) | SaaS feature plan |
| 07 | [07-inventory-api-documentation.md](07-inventory-api-documentation.md) | Inventory API documentation |
| 08 | [08-fix-api.md](08-fix-api.md) | API fixes notes |
| 09 | [09-api-changes-and-fixes.md](09-api-changes-and-fixes.md) | Pending backend work / API changes & fixes log |
| 10 | [10-auth-cookie.md](10-auth-cookie.md) | Cookie auth + logout contract |
| 11 | [11-payments-create-order.md](11-payments-create-order.md) | Create Razorpay order contract |
| 12 | [12-payments-verify.md](12-payments-verify.md) | Verify payment contract |
| 13 | [13-gift-vouchers.md](13-gift-vouchers.md) | Gift vouchers contract |
| 14 | [14-pricing-config.md](14-pricing-config.md) | Pricing config (GST) contract |
| 15 | [15-products-pricing-stock.md](15-products-pricing-stock.md) | Product pricing & stock fields |
| 16 | [16-addresses.md](16-addresses.md) | Address book + resend email contract |
| 17 | [17-requirements-expected-features.md](17-requirements-expected-features.md) | Pending backend requirements summary |
| 18 | [18-push-notifications.md](18-push-notifications.md) | Mobile push notifications (FCM) contract |
| 19 | [19-products-variants.md](19-products-variants.md) | Product size/weight variants (`variants`) contract |
| 20 | [20-products-pricing-config.md](20-products-pricing-config.md) | Per-product fixed price / making charge / wastage |
| 21 | [21-delivery-config.md](21-delivery-config.md) | Zone-based delivery charges contract |
| 22 | [22-products-multiple-images.md](22-products-multiple-images.md) | Multiple product images (`images` write side) + sliding gallery |
| 23 | [23-products-pagination.md](23-products-pagination.md) | Product list `page`/`limit` pagination (infinite scroll) |
| 24 | [24-product-price-calculation.md](24-product-price-calculation.md) | Silver-rate dynamic pricing (rate×weight + making + wastage; discount → GST → delivery) |
| 25 | [25-price-update-guard-and-notification.md](25-price-update-guard-and-notification.md) | Daily 10:00 IST rate-update guard (gold rates, cron, WhatsApp alert, authoritative block flag) |

## API contracts → client files

The endpoint-contract docs map to the storefront client files that depend on them:

| Contract | Doc | Client files |
|----------|-----|--------------|
| Cookie auth + logout | [10-auth-cookie.md](10-auth-cookie.md) | `src/lib/api.ts`, `src/context/AuthContext.tsx`, `src/services/auth.ts` |
| Create Razorpay order | [11-payments-create-order.md](11-payments-create-order.md) | `src/services/payment.ts`, `src/pages/Payment.tsx` |
| Verify payment | [12-payments-verify.md](12-payments-verify.md) | `src/services/payment.ts`, `src/pages/Payment.tsx` |
| Gift vouchers | [13-gift-vouchers.md](13-gift-vouchers.md) | `src/services/giftVoucher.ts`, `src/pages/GiftVouchers.tsx` |
| Pricing config (GST) | [14-pricing-config.md](14-pricing-config.md) | `src/services/pricingConfig.ts` |
| Product pricing & stock | [15-products-pricing-stock.md](15-products-pricing-stock.md) | `src/services/product.ts`, `src/pages/ProductDetail.tsx`, `src/components/ProductCard.tsx` |
| Address book + resend email | [16-addresses.md](16-addresses.md) | `src/services/address.ts`, `src/services/order.ts`, `src/pages/Payment.tsx`, `src/pages/OrderConfirmation.tsx` |
| Product variants | [19-products-variants.md](19-products-variants.md) | `src/services/product.ts`, `src/pages/Admin.tsx`, `src/pages/ProductDetail.tsx`, `src/components/ProductCard.tsx` |
| Fixed price / making charge / wastage | [20-products-pricing-config.md](20-products-pricing-config.md) | `src/services/product.ts`, `src/pages/Admin.tsx`, `src/pages/ProductDetail.tsx` |
| Delivery charges | [21-delivery-config.md](21-delivery-config.md) | `src/services/deliveryConfig.ts`, `src/pages/Admin.tsx`, `src/pages/Payment.tsx` |
| Dynamic price calculation | [24-product-price-calculation.md](24-product-price-calculation.md) | `src/lib/pricing.ts`, `src/components/ProductCard.tsx`, `src/pages/ProductDetail.tsx`, `src/context/CartContext.tsx`, `src/pages/Cart.tsx`, `src/pages/Payment.tsx` |
| Daily rate-update guard (gold rates, block flag) | [25-price-update-guard-and-notification.md](25-price-update-guard-and-notification.md) | `src/services/goldRate.ts`, `src/services/silverRate.ts`, `src/services/rateStatus.ts`, `src/lib/rateFreshness.ts`, `src/components/RateUpdateGate.tsx`, `src/pages/Admin.tsx` |
| Multiple product images | [22-products-multiple-images.md](22-products-multiple-images.md) | `src/services/product.ts`, `src/pages/Admin.tsx`, `src/components/ProductImageCarousel.tsx`, `src/components/ProductCard.tsx`, `src/pages/ProductDetail.tsx` |

> Note: docs were renumbered/flattened on 2026-06-16. Some inline cross-references inside individual
> docs may still mention old paths (e.g. `docs/api/...` or `API_CHANGES_AND_FIXES.md`) — use this
> index for the current locations.
