# Admin Panel Patch & Feature Plan

## Goal Description
Resolve critical functional bugs reported in the Admin Panel and introduce requested workflow enhancements for Products, Orders, Customers, Coupons, Category management, and Global Theme synchronisation.

## User Review Required
> [!IMPORTANT]  
> 1. **Image Upload:** Standard Base64 strings can be very large. Is your backend configured to accept multi-megabyte payloads for the product image, or should I compress the image down via canvas resizing before Base64 conversion?
> 2. **Categories Endpoint:** I'll be adding "Add/Delete Category" to the filters page. Does the backend already possess standalone CRUD endpoints for Categories, or were they historically inferred from product tags?

## Proposed Changes

### 1. Products: View / Edit Modals
#### [MODIFY] `src/pages/Admin.tsx` (Products Tab)
- Wire up the missing `onClick` events on the "Edit / View" buttons inside the product table.
- Implement an `EditProductModal` using the existing form structural layout, pre-filling state with the selected product properties. Connect it to `productService.updateProduct`.

### 2. Products: Add Product Flow Overhaul
#### [MODIFY] `src/pages/Admin.tsx` (Add Product Dialog)
- **Image handling:** Replace the raw string UI input with `<input type="file" accept="image/*" />`. Upon change, trigger a `FileReader` process to convert the file blobstorage into a Base64 encoded string before pushing to the API.
- **Dynamic Categories:** Remove the hardcoded category array ('Necklaces', etc.). Swap it to map over the dynamic `allCategories` query array.
- **Labeling:** Rename the `Purity` label to `Type`.

### 3. Orders & Customers Actions
#### [MODIFY] `src/pages/Admin.tsx` (Orders / Customers Tabs)
- Append an "Actions" column aligned to the right inside both data tables.
- Inject `Edit` and `Trash2` icon buttons.
- Connect deletions to `adminService.deleteOrder` and `adminService.deleteUser` after triggering a confirmation prompt.
- Connect editing to dialog modals similar to Products, allowing mutation of Order Status or Customer profiles.

### 4. Coupons: Undefined 404 Bug
#### [MODIFY] `src/pages/Admin.tsx` (Coupons Tab)
- **Root Cause:** The `coupon` object returned from the API uses `_id` instead of `id`, causing `coupon.id` to evaluate to `undefined` during the toggle/delete mutate calls.
- **Fix Mechanism:** Safely remap the deletion and toggle triggers to pass `id: coupon.id || coupon._id` into their generic mutations.

### 5. Filters: Manage Categories
#### [MODIFY] `src/pages/Admin.tsx` (Filters Tab)
- Under the "Category Visibility" block, add an "Add New Category" UI suite (Input Box + Button).
- Wire to a new `productService.createCategory` and `productService.deleteCategory` feature to enable hard modifications to the global category list.

### 6. Theme: Global Persistence
#### [MODIFY] `src/pages/Admin.tsx` (Theme Tab) & `src/App.tsx`
- **Current Flow:** Theme modifies purely on `localStorage` affecting only locally.
- **Adjustment:** Add a `Save Global Theme` button. Push the selected layout payload (Theme variant + Dark Mode bool) to an `adminService.updateStoreConfig` API. Let `App.tsx` pull this config globally upon bootstrap to unify aesthetics for all users.

## Verification Plan

### Automated/Local Layout
- Base64 parser intercepts uploaded files appropriately without UI locking.
- Forms render correctly. Null referencing on coupons is caught.

### Manual Verification
- Attempt toggling/deleting a coupon: Network tab must show a valid ID rather than `undefined`.
- Click 'Edit' on an order and manipulate status strings.
- Add product mapping triggers dynamic list instead of static fallback.
