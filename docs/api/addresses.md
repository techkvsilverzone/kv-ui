# Address book — `/users/me/addresses` + order confirmation resend

Account-bound saved addresses (replaces the device-local localStorage prefill for logged-in users)
and the resend-confirmation action. **Verified against `openapi.json`.**

## Endpoints

### `GET /users/me/addresses` → `Address[]` (bare array)
### `POST /users/me/addresses` (body `AddressInput`) → `Address`
### `PUT /users/me/addresses/{id}` (body `AddressInput`) → `Address`
### `DELETE /users/me/addresses/{id}` → 204

```jsonc
// Address (response)
{
  "id": "<addressId>",
  "label": "Home",          // optional
  "firstName": "Asha",
  "lastName": "K",
  "address": "14 Rajaram St",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600001",       // 6-digit
  "phone": "9876543210",     // 10-digit Indian mobile
  "isDefault": true          // optional
}
// AddressInput (request) = Address without `id`; required: firstName,lastName,address,city,state,pincode,phone
```

### `POST /orders/{id}/resend-confirmation` → `{ success, message }`
Auth: cookie (order owner). Re-sends the order confirmation email.

## Client behaviour
- `src/services/address.ts` — `getAddresses / createAddress / updateAddress / deleteAddress`
  (id normalised from `id`/`_id`).
- **Checkout** (`Payment.tsx`): authed users see a "Saved addresses" picker; the default (or first)
  prefills the form unless edited. On order success a new address is POSTed (skipping exact
  duplicates). Guests keep the `localStorage` prefill.
- **Order confirmation** (`OrderConfirmation.tsx`): `orderService.resendConfirmation(id)` behind a
  "Resend email" link.

## Confirm these fields
- `Address.id` / `_id`, `isDefault`, `label`.
- `GET` returns a bare array (no `{ status, data }` wrapper).
