# Delivery charges — `delivery-config`

Zone-based delivery charges, configurable by admins. Three zones, resolved from the
destination address:

| Zone | Rule | Default (₹) |
| --- | --- | --- |
| `chennai` | destination city is Chennai (home city) | 150 |
| `otherDistrict` | same state (Tamil Nadu) but not Chennai | 200 |
| `otherState` | any other state | 250 |

Zone resolution (client mirror in `src/services/deliveryConfig.ts` → `resolveDeliveryZone`):
`city === "chennai"` → `chennai`; else `state === "tamil nadu"` → `otherDistrict`; else `otherState`
(both compared case-insensitively, trimmed).

## Shape

```jsonc
{
  "chennai": 150,
  "otherDistrict": 200,
  "otherState": 250
}
```

All three are non-negative numbers (₹). Public endpoint may wrap in `{ status, data }` or return a
bare object — the client tolerates both.

## Endpoints

| Endpoint | Auth | Direction | Notes |
| --- | --- | --- | --- |
| `GET /delivery-config` | public | response | used at checkout to show the delivery charge |
| `GET /admin/delivery-config` | admin/staff | response | editable config for the admin panel |
| `PUT /admin/delivery-config` | admin | request + response | full replace of all three zone charges |

## Validation (enforce server-side too)

- each value is a finite number `≥ 0`.
- all three zones are required on `PUT`.

## Client behaviour (already implemented frontend-side)

- **Service** (`src/services/deliveryConfig.ts`): `DeliveryConfig`, `DEFAULT_DELIVERY_CONFIG`
  (150 / 200 / 250), `resolveDeliveryZone(address)`, `getDeliveryCharge(config, address)`.
- **Admin** (`src/pages/Admin.tsx`, Shipping tab → "Delivery Charges" card): edit the three zone
  amounts and save (`PUT /admin/delivery-config`). Inline validation; Save disabled while invalid.
  Falls back to defaults until the config loads.

## Not yet wired (next phase — money path, needs backend lockstep)

Applying the delivery charge to the **order total** is deferred so the displayed total never
diverges from the server-charged amount. When the backend is ready:

1. `POST /payments/create-order` must add the resolved zone charge to the authoritative `amount`
   and surface it in `breakdown` (e.g. `breakdown.deliveryCharge`). It already receives `pincode`;
   it will also need the destination `city`/`state` (or derive the zone from the pincode).
2. Checkout (`src/pages/Payment.tsx`) will then replace the hardcoded "Shipping: Free" line with
   the zone charge from `GET /delivery-config` and include it in the displayed total, reconciled
   against the server `breakdown`.
3. `verify` / COD order creation must apply the same charge server-side (never trust a
   client-computed total).

See also `API_CHANGES_AND_FIXES.md`.
