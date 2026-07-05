# `POST /payments/create-order`

Creates the Razorpay order. The client sends **no amount** — the server prices the order
authoritatively from the line items, coupon, and pincode.

## Request
```jsonc
{
  "items": [
    {
      "product": "<productId>",
      "quantity": 2,
      "isGiftVoucher": true,        // present only for voucher lines
      "giftVoucherId": "<voucherId>" // present only for voucher lines
    }
  ],
  "couponCode": "DIWALI10",          // optional
  "pincode": "600001"                // optional
}
```

## Response (client depends on `id` + `amount`)
```jsonc
{
  "id": "order_xxx",          // Razorpay order id — REQUIRED
  "amount": 123400,           // authoritative amount in paise — REQUIRED, used to open Razorpay
  "currency": "INR",
  "breakdown": {              // optional, display only — verified against openapi.json
    "items": [],              // OrderItem[]
    "subtotal": 0,
    "taxAmount": 0,
    "discount": 0,
    "couponCode": null,       // string | null
    "deliveryFee": 0,
    "grandTotal": 0
  }
}
```

## Notes
- The client passes the returned `amount`/`id` straight into the Razorpay checkout handler. It does
  **not** compute or trust any client-side total.
- `breakdown` field names match the implementation (`taxAmount`/`deliveryFee`/`grandTotal`, **not**
  `tax`/`shipping`/`total`). `src/services/payment.ts` `RazorpayOrderBreakdown` mirrors these.
- For gift-voucher lines the server should price from `giftVoucherId` and ignore any client price.

## Confirm these fields
- Response includes `id` and `amount` (paise).
- Server reads `isGiftVoucher`/`giftVoucherId` on voucher line items.
