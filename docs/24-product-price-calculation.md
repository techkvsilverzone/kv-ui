# Product price calculation (silver-rate dynamic pricing)

Wires the previously-deferred **dynamic price calculation** (see
[20-products-pricing-config.md](20-products-pricing-config.md)) into the storefront display.
Implemented frontend-side in `src/lib/pricing.ts` and consumed by Shop/Detail/Cart/Checkout.

## The model

```
Metal value (Product Price) = today's silver rate per gram × weight in grams
Pre-GST price (shown in Shop / Collections) = metal value + making charge + wastage

At checkout:
  discounted   = subtotal − coupon discount        (discount applied first)
  GST          = gstPercent % × discounted taxable subtotal
  Total to pay = discounted + GST + delivery charge (delivery added last)
```

- **Making charge** / **wastage** are `{ type: 'percentage' | 'amount', value }`. A percentage is
  taken against the **metal value**; an amount is a flat ₹ figure. (`resolveChargeAmount`.)
- **Fixed-price products** (`isFixedPrice: true`) skip the metal-value calc — their flat `price`
  **is** the pre-GST price. Discount, GST and delivery still apply to them.
- The silver rate is matched to the product by **purity** (`matchSilverRate`), falling back to the
  first available rate; weight is the product's `weightInGrams`/`weight`, or a **selected size
  variant's** weight on the product-detail page.
- A product only goes **"live"** (priced from rate × weight) when it is non-fixed, has a usable rate
  + weight, **and** has a making charge or wastage configured. Otherwise the calc **falls back to the
  listed `product.price`**. This mirrors the backend guard: legacy products with no charges keep
  their listed price (bare metal value would be below cost), so the displayed price stays in lockstep
  with the server-charged amount.

## Where it runs (client)

| File | Role |
|------|------|
| `src/lib/pricing.ts` | `computeProductPricing` (pre-GST unit price + breakdown) and `computeOrderSummary` (discount → GST → delivery). Pure, unit-tested in `pricing.test.ts`. |
| `src/components/ProductCard.tsx` | Shows the live pre-GST price; adds the computed price into the cart. |
| `src/pages/ProductDetail.tsx` | Live pre-GST price for the selected size + forward price breakdown (metal value / making / wastage). GST + delivery noted as "added at checkout". |
| `src/context/CartContext.tsx` | Line prices are pre-GST; exposes `totalPrice`, `taxableTotal` (excludes gift vouchers), `taxAmount`, `totalWithTax`. |
| `src/pages/Cart.tsx` | Summary: subtotal (before GST) + GST; delivery "calculated at checkout". |
| `src/pages/Payment.tsx` | Full summary via `computeOrderSummary` — discount, GST on the discounted taxable subtotal, zone delivery charge, total. |

## Backend contract (required — server is authoritative for the charge)

The frontend computes **display** prices only. `POST /payments/create-order` still receives **no
client amount** and must return the authoritative `{ amount, breakdown }`. To match what the customer
sees, the server **must** price using the same model:

1. For dynamic products **with a making charge / wastage configured**:
   `metalValue = ratePerGram(purity, today) × grams` (use the selected variant weight when the line
   item carries one), then `+ makingCharge + wastage`. Non-fixed products with **no** charge
   configured keep their listed `price` (the frontend mirrors this guard — see "The model" above).
2. Sum line items into a **pre-GST subtotal**.
3. Apply the coupon discount to the subtotal **before** GST.
4. Add **GST `gstPercent`%** (from pricing-config) on the discounted, taxable subtotal — gift
   vouchers are tax-inclusive and excluded from the taxable base.
5. Add the **zone delivery charge** (from delivery-config, resolved from the order `pincode`/address)
   **last**.
6. Return the `breakdown` so the client can reconcile.

> Until the server returns a `breakdown`, the on-screen numbers are an estimate from the live silver
> rate; the charged amount is whatever `create-order` returns. Keep the two models in lockstep.

See also: [14-pricing-config.md](14-pricing-config.md) (GST), [21-delivery-config.md](21-delivery-config.md)
(delivery zones), [09-api-changes-and-fixes.md](09-api-changes-and-fixes.md) (pending backend work).
