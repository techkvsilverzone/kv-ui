# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-01T06:23:12.625Z
> Files: 38 tracked | Anatomy hits: 0 | Misses: 0

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

- `Footer.tsx` — Footer (~1487 tok)
- `Navbar.tsx` — Navbar (~3027 tok)
- `ProductCard.tsx` — ProductCard (~2663 tok)
- `ProductImageCarousel.tsx` — Tailwind classes applied to each <img>. Should set the size/aspect (e.g. "w-full aspect-square objec (~952 tok)
- `RateUpdateGate.tsx` — Inline rate-update form for a single stale metal. Updating it clears the block. (~1500 tok)

## src/components/ui/


## src/context/

- `CartContext.tsx` — A size/weight variant of a product (think dress sizes S–XXL). (~3170 tok)

## src/data/


## src/hooks/

- `useReveal.ts` — Scroll-reveal: attach the returned ref to an element that has the `reveal` (~375 tok)

## src/lib/

- `pricing.test.ts` — Declares rate (~1611 tok)
- `pricing.ts` — Shared product price engine. (~1978 tok)
- `rateFreshness.test.ts` — Declares at (~1240 tok)
- `rateFreshness.ts` — Daily metal-rate freshness rules. (~1147 tok)

## src/pages/

- `Admin.tsx` — Editor for a product's size/weight variants (S–XXL style). Each row carries a free-text (~40490 tok)
- `Cart.tsx` — GIFT_WRAP_FEE (~3338 tok)
- `Index.tsx` — Index (~3702 tok)
- `Payment.test.tsx` — Cart with one ₹1,000 (pre-GST) item; GST 3% => 30. No address yet => delivery 0, total 1,030. (~961 tok)
- `Payment.tsx` — SAVED_ADDRESS_KEY (~6818 tok)
- `ProductDetail.tsx` — ProductDetail (~8152 tok)
- `Shop.tsx` — Products fetched per infinite-scroll batch. (~5645 tok)

## src/services/

- `deliveryConfig.test.ts` — Declares cfg (~714 tok)
- `deliveryConfig.ts` — Zone-based delivery charges (in ₹). Zones are resolved from the destination address: (~909 tok)
- `goldRate.ts` — Gold-rate domain. Mirrors {@link ../services/silverRate} against the `/gold-rates` (~537 tok)
- `product.test.ts` — Declares path (~1453 tok)
- `product.ts` — Normalizes the raw variants array from the API into clean ProductVariant objects, (~2017 tok)
- `rateStatus.test.ts` — Declares status (~462 tok)
- `rateStatus.ts` — Authoritative daily rate-update block flag, persisted server-side by the 10:00 IST cron (~472 tok)
- `silverRate.ts` — The server emits the rate date as `rateDate`; older/spec shapes use `date`. (~471 tok)

## src/test/

- `setup.ts` — Declares ResizeObserverStub (~284 tok)
