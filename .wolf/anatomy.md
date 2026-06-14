# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-14T12:42:38.177Z
> Files: 161 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~77 tok)
- `API_CHANGES_AND_FIXES.md` — KV Silver Zone — Pre-Delivery Fixes & Required API Changes (~3500 tok)
- `API_CHANGES.md` — KV Silver Zone — API Changes Required (~1833 tok)
- `API_DEFINITION.md` — KV Silver Zone — Complete API Definition (~5739 tok)
- `CLAUDE.md` — CLAUDE.md (~1495 tok)
- `components.json` (~124 tok)
- `eslint.config.js` — ESLint flat configuration (~226 tok)
- `index.html` — KV Silver Zone - Silver Selling eCommerce Platform (~293 tok)
- `package-lock.json` — npm lock file (~82427 tok)
- `package.json` — Node.js package manifest (~924 tok)
- `playwright.config.ts` — Playwright e2e config. Tests live in ./e2e (outside src/, so vitest ignores them). (~218 tok)
- `postcss.config.js` — PostCSS configuration (~25 tok)
- `README.md` — Project documentation (~529 tok)
- `tailwind.config.ts` — Tailwind CSS configuration (~1460 tok)
- `tsconfig.app.json` (~205 tok)
- `tsconfig.json` — TypeScript configuration (~110 tok)
- `tsconfig.node.json` (~144 tok)
- `vercel.json` (~25 tok)
- `vite.config.ts` — Vite build configuration (~116 tok)
- `vitest.config.ts` — Vitest test configuration (~118 tok)

## .claude/

- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## docs/api/

- `addresses.md` — Address book — `/users/me/addresses` + order confirmation resend (~437 tok)
- `auth-cookie.md` — Auth — httpOnly cookie session (~410 tok)
- `gift-vouchers.md` — `GET /gift-vouchers` (~325 tok)
- `payments-create-order.md` — `POST /payments/create-order` (~415 tok)
- `payments-verify.md` — `POST /payments/verify` (~401 tok)
- `pricing-config.md` — `GET /pricing-config` (~263 tok)
- `products-pricing-stock.md` — `GET /products` and `GET /products/:id` — pricing & stock fields (~433 tok)
- `README.md` — Project documentation (~438 tok)
- `REQUIREMENTS-expected-features.md` — API requirements — expected features needing backend work (~935 tok)

## e2e/

- `storefront.spec.ts` — Storefront smoke tests. These exercise UI shells and client-side behaviour that (~548 tok)

## plans/

- `page_implementation_plan.md` — KV Silver Zone - Implementation Plan for Missing & Partial Pages (~1868 tok)

## public/

- `robots.txt` (~44 tok)

## src/

- `App.css` — root { (~186 tok)
- `App.tsx` — queryClient (~1954 tok)
- `index.css` — Styles: 11 rules, 50 vars, 1 animations, 4 layers (~1178 tok)
- `main.tsx` (~68 tok)
- `vite-env.d.ts` — / <reference types="vite/client" /> (~12 tok)

## src/components/

- `ErrorBoundary.tsx` — Catches render-time errors anywhere below it and shows a recoverable fallback (~469 tok)
- `Footer.tsx` — Footer — renders map (~1377 tok)
- `InvoiceView.tsx` — Read-only invoice layout. Pass a `ref` when using react-to-print. (~1400 tok)
- `Marquee.tsx` — metalAliases — uses useState, useQuery (~990 tok)
- `Navbar.tsx` — Navbar (~3068 tok)
- `NavLink.tsx` — NavLink (~223 tok)
- `PassbookView.tsx` — Read-only passbook layout. Pass a `ref` when using react-to-print. (~1539 tok)
- `ProductCard.tsx` — ProductCard (~2041 tok)
- `RequireAuth.tsx` — Route guard for authenticated-only pages. Redirects unauthenticated users to (~217 tok)
- `ScrollToTop.tsx` — ScrollToTop — uses useEffect (~78 tok)
- `Seo.tsx` — Absolute or site-relative image for social cards. (~552 tok)

## src/components/ui/

- `accordion.tsx` — Accordion (~580 tok)
- `alert-dialog.tsx` — AlertDialog (~1262 tok)
- `alert.tsx` — alertVariants (~454 tok)
- `aspect-ratio.tsx` — AspectRatio (~43 tok)
- `avatar.tsx` — Avatar (~401 tok)
- `badge.tsx` — badgeVariants (~320 tok)
- `breadcrumb.tsx` — Breadcrumb (~794 tok)
- `button.tsx` — buttonVariants (~540 tok)
- `calendar.tsx` — Calendar (~748 tok)
- `card.tsx` — Card (~523 tok)
- `carousel.tsx` — CarouselContext — uses useContext, useState, useCallback, useEffect (~1850 tok)
- `chart.tsx` — Format: { THEME_NAME: CSS_SELECTOR } (~2940 tok)
- `checkbox.tsx` — Checkbox (~309 tok)
- `collapsible.tsx` — Collapsible (~94 tok)
- `command.tsx` — Command — renders modal (~1416 tok)
- `context-menu.tsx` — ContextMenu (~2106 tok)
- `dialog.tsx` — Dialog — renders modal (~1102 tok)
- `drawer.tsx` — Drawer — renders modal (~866 tok)
- `dropdown-menu.tsx` — DropdownMenu (~2126 tok)
- `form.tsx` — Form — renders form — uses useContext (~1184 tok)
- `hover-card.tsx` — HoverCard (~349 tok)
- `input-otp.tsx` — InputOTP — uses useContext (~637 tok)
- `input.tsx` — Input (~235 tok)
- `label.tsx` — labelVariants (~204 tok)
- `menubar.tsx` — MenubarMenu (~2306 tok)
- `navigation-menu.tsx` — NavigationMenu (~1472 tok)
- `pagination.tsx` — Pagination (~790 tok)
- `popover.tsx` — Popover (~363 tok)
- `progress.tsx` — Progress (~226 tok)
- `radio-group.tsx` — RadioGroup (~424 tok)
- `resizable.tsx` — ResizablePanelGroup (~496 tok)
- `scroll-area.tsx` — ScrollArea (~471 tok)
- `select.tsx` — Select (~1634 tok)
- `separator.tsx` — Separator (~206 tok)
- `sheet.tsx` — Sheet (~1230 tok)
- `sidebar.tsx` — SIDEBAR_COOKIE_NAME — uses useContext, useState, useCallback, useEffect (~6707 tok)
- `skeleton.tsx` — Skeleton (~69 tok)
- `slider.tsx` — Slider (~311 tok)
- `sonner.tsx` — Toaster (~259 tok)
- `switch.tsx` — Switch (~336 tok)
- `table.tsx` — Table — renders table (~791 tok)
- `tabs.tsx` — Tabs (~558 tok)
- `textarea.tsx` — Textarea (~221 tok)
- `toast.tsx` — ToastProvider (~1403 tok)
- `toaster.tsx` — Toaster (~216 tok)
- `toggle-group.tsx` — ToggleGroupContext — uses useContext (~504 tok)
- `toggle.tsx` — toggleVariants (~416 tok)
- `tooltip.tsx` — TooltipProvider (~338 tok)
- `use-toast.ts` (~25 tok)

## src/context/

- `AuthContext.tsx` — Derive a normalised role from the User object returned by the API. (~1380 tok)
- `CartContext.tsx` — Set for gift-voucher line items so the server can price them authoritatively. (~2707 tok)

## src/data/

- `products.ts` — Exports products, categories (~1134 tok)

## src/hooks/

- `use-mobile.tsx` — MOBILE_BREAKPOINT — uses useEffect (~170 tok)
- `use-toast.ts` — Exports reducer (~1178 tok)

## src/lib/

- `analytics.ts` — Analytics + error monitoring, gated entirely on env vars so the app runs untouched (~594 tok)
- `api.ts` — Exports api (~531 tok)
- `image.ts` — Known base64 magic-byte prefixes for common image types. (~615 tok)
- `utils.ts` — Exports cn (~50 tok)
- `validation.test.ts` — Declares r (~924 tok)
- `validation.ts` — Shared form validation schemas (zod) used across the storefront forms. (~963 tok)

## src/pages/

- `About.tsx` — About (~2046 tok)
- `Admin.tsx` — Admin (~25924 tok)
- `Cart.tsx` — GIFT_WRAP_FEE (~3258 tok)
- `ChangePassword.tsx` — ChangePassword — renders form — uses useState (~1300 tok)
- `Contact.tsx` — Contact — renders form (~3579 tok)
- `CustomerDashboard.tsx` — statusColors (~2512 tok)
- `FAQ.tsx` — faqData (~3856 tok)
- `ForgotPassword.tsx` — ForgotPassword — renders form — uses useState (~1196 tok)
- `GiftVouchers.tsx` — Rotating gradient palette so API-driven vouchers still look distinct. (~1957 tok)
- `Index.tsx` — Index (~3609 tok)
- `Login.tsx` — Login — renders form (~1672 tok)
- `NotFound.tsx` — NotFound — uses useEffect (~215 tok)
- `Offers.tsx` — campaigns (~2136 tok)
- `OrderConfirmation.tsx` — OrderConfirmation (~3056 tok)
- `OrderTracking.tsx` — statusSteps (~3067 tok)
- `Payment.test.tsx` — Cart with one ₹1,000 item; GST 3% => tax 30, total 1,030. (~852 tok)
- `Payment.tsx` — SAVED_ADDRESS_KEY (~6503 tok)
- `PrivacyPolicy.tsx` — Section (~2153 tok)
- `ProductDetail.tsx` — Extracts the numeric gram value from a free-text weight string (e.g. "10.5 g" -> 10.5). (~7813 tok)
- `Profile.tsx` — Profile (~4396 tok)
- `SavingsScheme.tsx` — SavingsScheme (~5334 tok)
- `Shop.test.tsx` — renderShop (~951 tok)
- `Shop.tsx` — Shop (~3767 tok)
- `Signup.tsx` — Signup — renders form (~2603 tok)
- `SilverRate.tsx` — metalAliases — renders table (~3213 tok)
- `TermsConditions.tsx` — Section (~2268 tok)
- `Wishlist.tsx` — Wishlist — uses useQuery (~597 tok)

## src/services/

- `address.ts` — Matches the Address schema in openapi.json. (~342 tok)
- `admin.test.ts` — Declares orders (~548 tok)
- `admin.ts` — Exports AdminStats, adminService (~688 tok)
- `auth.test.ts` — Declares response (~536 tok)
- `auth.ts` — Exports AuthResponse, authService (~368 tok)
- `cart.ts` — Exports ApiCartItem, ApiCart, cartService (~262 tok)
- `contact.ts` — Exports ContactPayload, contactService (~98 tok)
- `coupon.test.ts` — Declares result (~518 tok)
- `coupon.ts` — Exports Coupon, ApplyCouponPayload, ApplyCouponResponse, CreateCouponPayload, couponService (~525 tok)
- `giftVoucher.ts` — Exports GiftVoucher, giftVoucherService (~473 tok)
- `inventory.ts` — Exports InventoryTransaction, StockInwardPayload, StockOutwardPayload, ReconcilePayload, LowStockItem, InventorySummary, TransactionFilters, inventoryService (~350 tok)
- `order.ts` — Exports OrderItem, Order, CreateOrderPayload, orderService (~447 tok)
- `payment.ts` — Server prices the order from these line items; no client amount is trusted. (~549 tok)
- `pricingConfig.ts` — GST percentage as a whole number, e.g. 3 means 3%. (~328 tok)
- `product.test.ts` — Declares path (~573 tok)
- `product.ts` — Extracts the primary image from an API product response. (~1293 tok)
- `returns.ts` — Exports ReturnRequest, CreateReturnPayload, returnsService (~573 tok)
- `review.ts` — Exports Review, CreateReviewPayload, ProductReviewSummary, reviewService (~286 tok)
- `savings.ts` — Exports SavingsEnrollmentPayload, SavingsEnrollment, savingsService (~206 tok)
- `silverRate.ts` — Exports SilverRate, UpdateSilverRatePayload, silverRateService (~429 tok)
- `storeConfig.ts` — Exports StoreConfig, DEFAULT_STORE_CONFIG, storeConfigService (~130 tok)
- `wishlist.ts` — API routes: POST, DELETE (2 endpoints) (~752 tok)

## src/test/

- `example.test.ts` (~43 tok)
- `setup.ts` (~106 tok)
