# Product pricing config — `isFixedPrice`, `makingCharge`, `wastage`

Adds three optional admin-configured pricing fields to a product:

- **`isFixedPrice`** (`boolean`) — when `true` the product is bought and sold at a single flat
  price; there is **no** dynamic metal-rate calculation. When `true`, `makingCharge` and `wastage`
  do not apply (the client omits them).
- **`makingCharge`** (`{ type, value }`) — the making charge for the product.
- **`wastage`** (`{ type, value }`) — the wastage charge for the product.

`makingCharge` / `wastage` feed the **dynamic price calculation** (next phase) — they are captured
and persisted now but do not yet affect cart/checkout totals.

> Distinct from the server-computed `pricing.makingCharge` (a rupee figure in the display
> breakdown, see `products-pricing-stock.md`). These new fields are the admin **configuration**
> the server uses to derive that breakdown.

## Shape

```jsonc
{
  // …existing product fields…
  "isFixedPrice": false,
  "makingCharge": { "type": "percentage", "value": 12 },   // 12% making charge
  "wastage":      { "type": "amount",     "value": 250 }    // ₹250 flat wastage
}
```

### `type` enum
| value | meaning |
| --- | --- |
| `"percentage"` | `value` is a percent (0–100) |
| `"amount"` | `value` is a flat rupee amount (≥ 0) |

`value` is a non-negative `number`. Fields are optional and may be absent/`null` when not set.
A fixed-price product (`isFixedPrice: true`) will have no `makingCharge` / `wastage`.

## Endpoints

| Endpoint | Direction | Notes |
| --- | --- | --- |
| `GET /products` | response | products may carry these fields |
| `GET /products/:id` | response | may carry these fields |
| `POST /admin/products` | request + response | accepts + persists + echoes |
| `PUT /admin/products/:id` | request + response | full replace; omitted/absent charge clears it |

## Validation (enforce server-side too)

Mirror the client rules:
- `value` must be a finite number `≥ 0`.
- when `type === "percentage"`, `value` must be `≤ 100`.
- empty / unset charge is allowed (optional).
- when `isFixedPrice === true`, ignore/clear `makingCharge` and `wastage`.

## Client behaviour (already implemented frontend-side)

- **Type/normalization** (`src/context/CartContext.tsx`, `src/services/product.ts`):
  `ChargeType = 'percentage' | 'amount'`, `ProductCharge = { type, value }`. `normalizeCharge`
  drops charges without a finite numeric value and defaults an unknown `type` to `percentage`.
- **Admin** (`src/pages/Admin.tsx`): create + edit forms have a Fixed-Price switch and two
  `ChargeInput` rows (type selector + value) with inline validation (`validateCharge`). The submit
  button is disabled while a charge is invalid. Toggling Fixed-Price hides + omits the charge inputs.
- **Product detail** (`src/pages/ProductDetail.tsx`): the estimated price-breakdown block is hidden
  for `isFixedPrice` products (a metal/making split would be misleading).

## Not yet wired (next phase)

The dynamic price calculation that consumes `makingCharge` + `wastage` (and per-variant weight)
to compute the cart/checkout total. Server stays authoritative for the charged amount.
