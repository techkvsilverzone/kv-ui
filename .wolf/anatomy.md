# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-19T19:25:24.669Z
> Files: 100 tracked | Anatomy hits: 0 | Misses: 0

## ../kv-api/

- `.gitignore` — Git ignore rules (~637 tok)

## ../kv-api/src/

- `app.ts` — API routes: GET (3 endpoints) (~771 tok)
- `server.ts` — Declares PORT (~604 tok)

## ../kv-api/src/config/

- `index.ts` — Exports config (~1144 tok)

## ../kv-api/src/controllers/

- `return.controller.ts` — Exports ReturnController (~929 tok)
- `savings.controller.ts` — Request is used for admin endpoints that don't need user context (~630 tok)
- `user.controller.ts` — Exports UserController (~1501 tok)
- `whatsappWebhook.controller.ts` — Meta's one-time subscription handshake: GET with hub.mode/hub.verify_token/hub.challenge. (~916 tok)

## ../kv-api/src/models/

- `invoiceConfig.model.ts` — Exports IInvoiceConfig, InvoiceConfig (~260 tok)
- `order.model.ts` — Sequential per-financial-year tax invoice number, e.g. "INV-2026-000123". (~1174 tok)
- `otpCode.model.ts` — Exports IOtpCode, OtpCode (~279 tok)
- `return.model.ts` — Whether this is a KV-fault claim (refund/replacement eligible) or a customer-preference (~812 tok)
- `stallConfig.model.ts` — Exports IStallConfig, StallConfig (~157 tok)
- `unmatchedReturnVideo.model.ts` — An unboxing video received on the returns WhatsApp number that couldn't be (~350 tok)
- `user.model.ts` — Used for the daily WhatsApp birthday-wish cron (year is ignored — only month/day matter). (~638 tok)

## ../kv-api/src/repositories/

- `invoiceConfig.repository.ts` — Exports InvoiceConfigValues, DEFAULT_INVOICE_CONFIG, InvoiceConfigRepository (~359 tok)
- `order.repository.ts` — Sequential per-calendar-year tax invoice number, e.g. "INV-2026-000123". (~1394 tok)
- `otpCode.repository.ts` — The most recent unconsumed, unexpired, not-yet-locked-out code for this identifier+purpose. (~314 tok)
- `return.repository.ts` — Returns still awaiting a video whose ORDER's shipping-address phone matches (~1124 tok)
- `savings.repository.ts` — Active schemes with the owner's phone populated — used by the daily reminder cron. (~740 tok)
- `stallConfig.repository.ts` — Whether offline-stall registration mode is currently active, defaulting to off. (~275 tok)
- `unmatchedReturnVideo.repository.ts` — Unlinked videos only — once linked to a return they drop off the reconciliation queue. (~344 tok)

## ../kv-api/src/routes/

- `admin.routes.ts` — API routes: GET, POST (8 endpoints) (~17147 tok)
- `auth.routes.ts` — API routes: POST (6 endpoints) (~1365 tok)
- `index.ts` — Declares router (~686 tok)
- `invoiceConfig.routes.ts` — API routes: GET (1 endpoints) (~416 tok)
- `return.routes.ts` — API routes: POST, GET (3 endpoints) (~1606 tok)
- `savings.routes.ts` — API routes: POST, GET (4 endpoints) (~2231 tok)
- `stallConfig.routes.ts` — API routes: GET (1 endpoints) (~318 tok)
- `whatsappWebhook.routes.ts` — API routes: GET, POST (2 endpoints) (~336 tok)

## ../kv-api/src/services/

- `birthdayWish.service.ts` — Daily WhatsApp birthday and wedding-anniversary wishes. Only month/day are (~566 tok)
- `otp.service.ts` — Generates a 6-digit numeric code using a CSPRNG (not Math.random). (~1157 tok)
- `payment.service.ts` — B2: Create a Razorpay order for an amount the SERVER computes from the cart (~2772 tok)
- `rateGuard.service.ts` — Daily price-update guard (#25 B2). Determines which metals are missing today's (~811 tok)
- `return.service.ts` — Public policy info the frontend needs to render the "send us a video" instructions. (~2041 tok)
- `savings.service.ts` — Track a scheme by its passbook number — the customer-facing lookup key. (~1021 tok)
- `savingsReminder.service.ts` — Daily WhatsApp reminders for savings-scheme installments: day 1 / 5 / 10 overdue, (~679 tok)
- `user.service.ts` — Exports UserService (~2110 tok)

## ../kv-api/src/utils/

- `emailNotifications.ts` — Map a persisted order document into the confirmation email payload, including (~4728 tok)
- `whatsapp.ts` — Send a plain-text WhatsApp message via the Meta WhatsApp Cloud API. (~2362 tok)
- `whatsappMedia.ts` — Where downloaded return-unboxing videos are written. Not committed to git (see .gitignore) — (~1073 tok)

## ./

- `tailwind.config.ts` — /*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"], (~1485 tok)

## .claude/


## .claude/rules/


## C:/Users/Gayathri/.claude/projects/d--KraftLabs-KV-Silver-Zone-Source-kv-silver-zone/memory/

- `MEMORY.md` — Memory Index (~40 tok)
- `repomix-codebase-snapshot.md` (~246 tok)

## docs/

- `22-products-multiple-images.md` — Product multiple images — `images` field (write side) (~656 tok)
- `23-products-pagination.md` — Product list pagination — `page` / `limit` (infinite scroll) (~627 tok)
- `24-product-price-calculation.md` — Product price calculation (silver-rate dynamic pricing) (~1058 tok)
- `25-price-update-guard-and-notification.md` — 25 — Daily Price-Update Guard & WhatsApp Notification (~1532 tok)
- `README.md` — Project documentation (~1460 tok)

## docs/api/

- `delivery-config.md` — Delivery charges — `delivery-config` (~681 tok)
- `products-pricing-config.md` — Product pricing config — `isFixedPrice`, `makingCharge`, `wastage` (~792 tok)

## e2e/


## plans/


## public/


## src/

- `index.css` — Styles: 12 rules, 61 vars (~1952 tok)

## src/components/

- `FloatingRateWidget.tsx` — Fixed, always-visible bottom-right rate card for the Home page — a static (~748 tok)
- `Footer.tsx` — Footer (~1508 tok)
- `InvoiceView.tsx` — Read-only invoice layout. Pass a `ref` when using react-to-print. (~1656 tok)
- `Navbar.tsx` — Navbar (~3108 tok)
- `PassbookView.tsx` — Read-only passbook layout. Pass a `ref` when using react-to-print. (~1729 tok)
- `ProductCard.tsx` — ProductCard (~2663 tok)
- `ProductImageCarousel.tsx` — Tailwind classes applied to each <img>. Should set the size/aspect (e.g. "w-full aspect-square objec (~952 tok)
- `RateUpdateGate.tsx` — Inline rate-update form for a single stale metal. Updating it clears the block. (~1500 tok)

## src/components/ui/


## src/context/

- `AuthContext.tsx` — Used for the daily WhatsApp birthday-wish cron (year is ignored). (~1976 tok)
- `CartContext.tsx` — A size/weight variant of a product (think dress sizes S–XXL). (~3170 tok)

## src/data/


## src/hooks/

- `useReveal.ts` — Scroll-reveal: attach the returned ref to an element that has the `reveal` (~375 tok)

## src/lib/

- `api.ts` — Exports API_URL, api (~673 tok)
- `pricing.test.ts` — Declares rate (~1611 tok)
- `pricing.ts` — Shared product price engine. (~1978 tok)
- `rateFreshness.test.ts` — Declares at (~1240 tok)
- `rateFreshness.ts` — Daily metal-rate freshness rules. (~1147 tok)

## src/pages/

- `Admin.tsx` — Editor for a product's size/weight variants (S–XXL style). Each row carries a free-text (~45523 tok)
- `Cart.tsx` — GIFT_WRAP_FEE (~3338 tok)
- `CustomerDashboard.tsx` — statusColors (~2516 tok)
- `FAQ.tsx` — faqData (~3996 tok)
- `Index.tsx` — Index (~3734 tok)
- `Login.tsx` — Login — renders form (~3155 tok)
- `Payment.test.tsx` — Cart with one ₹1,000 (pre-GST) item; GST 3% => 30. No address yet => delivery 0, total 1,030. (~961 tok)
- `Payment.tsx` — SAVED_ADDRESS_KEY (~6343 tok)
- `ProductDetail.tsx` — ProductDetail (~8170 tok)
- `Profile.tsx` — Profile (~7847 tok)
- `SavingsScheme.tsx` — SavingsScheme (~6319 tok)
- `Shop.tsx` — Products fetched per infinite-scroll batch. (~5645 tok)
- `Signup.tsx` — Signup — renders form (~2741 tok)
- `SilverRate.tsx` — metalAliases — renders table (~4013 tok)
- `TermsConditions.tsx` — Section (~2471 tok)

## src/services/

- `admin.ts` — Send a WhatsApp broadcast (festival promotions etc.) to all registered customers. (~954 tok)
- `auth.ts` — Exports AuthResponse, authService (~504 tok)
- `deliveryConfig.test.ts` — Declares cfg (~714 tok)
- `deliveryConfig.ts` — Zone-based delivery charges (in ₹). Zones are resolved from the destination address: (~909 tok)
- `goldRate.ts` — Gold-rate domain. Mirrors {@link ../services/silverRate} against the `/gold-rates` (~537 tok)
- `invoiceConfig.ts` — Company details (GSTIN, address) printed on customer-facing tax invoices. (~589 tok)
- `order.ts` — Sequential tax invoice number generated server-side, e.g. "INV-2026-000123". (~480 tok)
- `payment.ts` — Server prices the order from these line items; no client amount is trusted. (~733 tok)
- `product.test.ts` — Declares path (~1453 tok)
- `product.ts` — Normalizes the raw variants array from the API into clean ProductVariant objects, (~2017 tok)
- `rateStatus.test.ts` — Declares status (~462 tok)
- `rateStatus.ts` — Authoritative daily rate-update block flag, persisted server-side by the 10:00 IST cron (~472 tok)
- `returns.ts` — Exports ReturnFaultType, ReturnVideoStatus, VideoInstructions, ReturnRequest + 5 more (~990 tok)
- `savings.ts` — Unique per-enrollment tracking number, e.g. "PB-00000042". One customer can hold (~392 tok)
- `silverRate.ts` — The server emits the rate date as `rateDate`; older/spec shapes use `date`. (~471 tok)
- `stallConfig.ts` — Offline-stall registration mode: when active, /signup?stall=1 shows the stall (~467 tok)

## src/test/

- `setup.ts` — Declares ResizeObserverStub (~284 tok)
