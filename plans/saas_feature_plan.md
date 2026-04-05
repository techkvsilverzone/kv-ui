# KV Silver Zone Feature Expansion Master Plan

## Goal Description
Expand KV Silver Zone with enterprise-grade e-commerce capabilities, transforming it into a robust SaaS-like platform. This involves implementing robust multi-level RBAC, advanced pricing & tax controls (GST, Shipping), omni-channel acquisition tools (Offline Stalls), and multi-tenant Savings Scheme tracking via Passbooks.

## User Review Required
> [!IMPORTANT]  
> Please review the proposed permission boundaries between Admin and Staff, as well as the Cart checkout logic for taxation and shipping. Let me know if you approve this roadmap before execution begins!

## Proposed Changes

### 1. Collections Sorting & Filtering
#### [MODIFY] `src/pages/Shop.tsx`
- Refactor `selectedCategory`, `selectedPriceRange`, and `selectedMetal` into `useState<string[]>([])` to support multiple selections.
- Implement mutual-exclusivity: 
  - On `searchQuery` update: clear all filter arrays.
  - On `toggleCategory` / `togglePriceRange` update: reset `searchQuery` to empty.
- Update `queryFn` API call to seamlessly send comma-separated arrays to backend.

---

### 2. RBAC (Role-Based Access Control)
#### [MODIFY] `src/context/AuthContext.tsx`
- Update `User` interface: replace `isAdmin?: boolean` with `role: 'admin' | 'staff' | 'customer'`.
#### [MODIFY] `src/services/admin.ts` & `src/pages/Admin.tsx`
- Implement Strict Role Gates:
  - **Admin**: Full access.
  - **Staff**: CRUD on Products, Stocks, Orders, Customers, Rates, Coupons, Savings, Returns.
  - **Customer**: Restricted to storefront and profile.
- Hide "Payments & Transactions" tabs and sensitive financial logging components in the Admin Dashboard if `user.role === 'staff'`.

---

### 3. Customer Portal & Tracking
#### [NEW] `src/pages/CustomerDashboard.tsx` (or expand existing `/profile`)
- A unified multi-tab dashboard for active customers.
- **My Orders Tab**: Realtime status pill (Pending, Shipped, Delivered) and Payment Status tracking.
- **My Savings Tab**: View joined schemes, maturity dates, and passbook ledgers.
#### [NEW] `src/components/PassbookView.tsx` & `src/components/InvoiceView.tsx`
- Read-only UI layouts optimized for print (`@media print` CSS rules) to allow generating clean, standardized invoices and passbooks.

---

### 4. Taxation & Shipping Logic
#### [MODIFY] `src/context/CartContext.tsx`
- Add Global GST Calculation mechanism: `const tax = total * 0.03;`.
#### [NEW] `src/pages/Admin/ShippingConfig.tsx`
- Admin UI to CRUD `PinCodeRate` objects (e.g., Pincode `600001` -> ₹50).
- Extend Checkout logic to cross-reference the user's destination pin code against this rate matrix to dynamically inject the delivery fee.

---

### 5. Gift Vouchers
#### [NEW] `src/pages/GiftVouchers.tsx`
- Dedicated catalogue for digital/physical gift cards.
- **Cart Exception Rule**: Gift vouchers get flagged with `isGiftVoucher: true`. The 3% global GST block will safely **skip** items with this flag since the tax is already inclusive.

---

### 6. Offline Stall & Promos
#### [MODIFY] `src/pages/Admin/StoreConfig.tsx`
- Add Global Toggle: `Offline Stall Event Active [ON/OFF]`.
#### [MODIFY] `src/pages/Auth/Register.tsx`
- If the offline stall mode is active, prompt/flag the registration. Upon successful registration, auto-credit a `Coupon` to their account as a promotional reward.

---

### 7. Savings Scheme Multitenancy
#### Backend/Schema Note
- The primary key for tracking schemes revolves around `user.phone`.
- Rather than a rigid 1:1 `User -> Scheme`, we will map `1:N`.
#### [MODIFY] `src/pages/SavingsScheme.tsx`
- Adapt UI constraints to allow a user to enroll in *another* scheme even if they are currently active in one. 
- Each unique enrollment returns and tracks a unique `passbookNumber`.

## Open Questions

> [!WARNING]  
> 1. Do you have the backend API endpoints already configured for these RBAC roles and Pin Code delivery charges, or should I scaffold the frontend to mock them for now?
> 2. For the PDF generation (Invoices/Passbook), do you want a pure CSS print-stylesheet solution on the browser, or should we integrate a PDF bundling library like `jspdf`? 

## Verification Plan

### Automated/Local Execution
- Validate filter/search mutual exclusivity on the Shop page locally.
- Unit test CartContext total math ensuring 3% GST calculation skips Voucher products.

### Manual Verification
- Log in utilizing a mocked `staff` role and verify payment datasets are hidden.
- Run through a mocked checkout to ensure Pin Code validation logic applies correctly.
