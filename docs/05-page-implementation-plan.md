# KV Silver Zone - Comprehensive Master Implementation Plan

## Overview
This master plan details the UI and API structures for every aspect of the KV Silver Zone e-commerce system. Tailored specifically for a premium silver/gold jewelry application, this plan ensures the system emphasizes high-trust indicators (purity, hallmarks, weight parameters), luxury aesthetics, and robust backend handling for jewelry-specific data mapping.

---

## 1. Existing Customer-Facing Pages (To Be Refined)

### 1.1 Homepage (`Index.tsx`)
- **UI Structure:**
  - Premium Hero slider (slow-moving visuals/video of shimmering jewelry).
  - Categorized browsing: "Shop by Occasion" & "Shop by Collection" (e.g., Bridal, Daily Wear, Gifting).
  - Trust Bar highlights: "100% Certified 925 Silver", "Easy Returns & Exchanges", "Secured/Insured Shipping", "BIS Hallmarked".
  - Featured & Bestselling quick-add carousels.
- **API Structure:**
  - **Endpoint:** `GET /api/storefront/homepage`
  - **Payload:** `{ heroBanners: [...], curatedCollections: [...], featuredProducts: [...], trustBadges: [...] }`

### 1.2 Product Listing (`Shop.tsx`)
- **UI Structure:**
  - Advanced jewelry-specific filters (Metal Purity, Gemstones/Enamel, Weight range, Size availability, Price).
  - High-res product cards with secondary image reveal on hover.
  - "Add to Wishlist" and "Quick View" modal actions.
- **API Structure:**
  - **Endpoint:** `GET /api/products?metalType=silver925&category=rings&sort=bestselling&page=1`
  - **Payload:** `{ pagination: {...}, products: [{ id, name, defaultPrice, weightGrams, primaryImage, inStock: true }] }`

### 1.3 Product Detail (`ProductDetail.tsx`)
- **UI Structure:**
  - Deep-zoom image gallery and a 360-degree rotation view if available.
  - Clear Price breakdown (Metal value + Making charges + GST) - crucial for transparency in gold/silver.
  - Informative modals: Ring/Bangle size guides and "Drop a Hint" generic sharing.
  - Delivery pincode checker to verify prompt/insured delivery availability.
- **API Structure:**
  - **Endpoint:** `GET /api/products/{slug}`
  - **Payload:** `{ productDetails, images, dimensions: { weight, purity }, pricingBreakdown: { metalPrice, makingCharge, tax, total }, estimatedDelivery: {...} }`

### 1.4 Cart Page (`Cart.tsx`)
- **UI Structure:**
  - Transparent order summary.
  - Strategic upsells (e.g., "Add a silver anti-tarnish polishing cloth").
  - Gifting enhancements (Gift wrap toggle, personalized printed message field).
- **API Structure:**
  - **Endpoint:** `GET /api/cart`, `POST /api/cart/update`, `POST /api/cart/apply-coupon`
  - **Payload:** `{ items: [...], subtotal, discount, giftWrapFee, total }`

### 1.5 Checkout Page (`Payment.tsx`)
- **UI Structure:**
  - Streamlined accordion layout (Address -> Shipping Method -> Payment).
  - "Secured by 256-bit AES protection" trust communication.
  - Appropriate payment routing (UPI/Cards/Net Banking, potentially offering BNPL/EMI for high-ticket pieces).
- **API Structure:**
  - **Endpoint:** `POST /api/checkout/initiate`, `POST /api/checkout/verify`
  - **Payload:** `{ orderId, transactionAmount, gatewayToken, shippingDetails: {...} }`

### 1.6 Authentication (`Login.tsx`, `Signup.tsx`)
- **UI Structure:**
  - Elegant modal or split-screen design.
  - Option to enable OTP verification flows (highly utilized in localized jewelry e-commerce to ensure deliverability and trust).
- **API Structure:**
  - **Endpoint:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/send-otp`

### 1.7 User Dashboard & Orders (`Profile.tsx`, `OrderTracking.tsx`)
- **UI Structure:**
  - Profile features: Address book, ring sizing preferences, key dates (birthdays/anniversaries) to trigger automated marketing offers.
  - Order History: Visual stepper timeline (Processing -> Hallmarked & Packed -> Shipped -> Delivered).
  - Downloads: Direct access to download VAT/GST Invoices and Authenticity Certificates.
- **API Structure:**
  - **Endpoint:** `GET /api/users/profile`, `GET /api/users/orders/{orderId}/tracking`

### 1.8 Support Pages (`About.tsx`, `Contact.tsx`)
- **UI Structure:**
  - About: Rich storytelling about brand heritage, craftsmanship, ethical metal sourcing, and purity guarantees.
  - Contact: Direct WhatsApp integration, VIP concierge styling form, and interactive map for boutique locations.
- **API Structure:**
  - **Endpoint:** `POST /api/contact/submit-inquiry`

### 1.9 Wishlist (`Wishlist.tsx`)
- **UI Structure:**
  - Mood board style grid of saved items. Quick "Move to Cart" capability.
  - Dynamic stock status indicators (e.g., "Low in stock in your size!").
- **API Structure:**
  - **Endpoint:** `GET /api/users/wishlist`, `POST /api/users/wishlist/{productId}`

---

## 2. Partial Customer-Facing Pages (To Be Completed)

### 2.1 Search Results Page
- **Current State:** Embedded in Shop query flow. Needs externalization.
- **UI/API Structure:** Dedicated page supporting high-speed typographic auto-suggestions. Emphasizes trending and popular jewelry categories if no results are found.
- **Payload:** `GET /api/products/search?q={query}` (returning facets for metal, carat, category).

### 2.2 Address Management Page
- **Current State:** Basic flat fields. Needs dedicated CRUD loop.
- **UI/API Structure:** Nested profile route rendering "address cards" with "Default Shipping" badges.
- **Endpoints:** CRUD lifecycle mapping to `/api/users/{userId}/addresses`.

### 2.3 FAQ Page
- **Current State:** Small section inside savings scheme. 
- **UI/API Structure:** Large nested accordion. Needs to specifically address Purity Guarantees, Buyback/Exchange Policies, Silver Care Guides, and Shipping Insurance.

---

## 3. Missing Customer-Facing Pages (To Be Built)

### 3.1 Legal (Privacy Policy & Terms/Conditions Pages)
- **UI/API Architecture:** Standard typography-focused markdown or HTML viewers, retrieved via CMS headless payload `GET /api/content/legal/{docType}`.

### 3.2 Recently Viewed Page
- **UI/API Architecture:** Cookie/Session-based carousel to allow shoppers to quickly rediscover high-consideration pieces they've analyzed.

### 3.3 Offers/Deals Page
- **UI/API Architecture:** Dedicated campaign landing page (e.g., "Akshaya Tritiya Specials" or "Valentine's Gifting"). Relies on `GET /api/campaigns/active`.

### 3.4 Order Confirmation
- **UI/API Architecture:** The "Thank You" post-payment milestone. Confirms success, captures email for receipts, and offers actionable link mapping back to `OrderTracking.tsx`.

---

## 4. Existing Admin & Business Pages (To Be Refined)

### 4.1 Admin Dashboard (`Admin.tsx`)
- **UI Structure:**
  - Topline Sales Overviews.
  - Potential live widget demonstrating current global Silver/Gold rates to help administrators make quick pricing coefficient tweaks.
- **API Structure:** `GET /api/admin/dashboard/stats`

### 4.2 Orders & Fulfillment Management
- **UI Structure:**
  - Status filters (picking, jewelry polishing, packing, ready-to-dispatch).
  - Bulk actions to generate Airway Bills (AWB) and trigger logistics partner APIs.
  - PDF generation actions for dynamic Invoices and Product Authentication Certificates.
- **API Structure:** `PUT /api/admin/orders/{id}/status`, `POST /api/admin/orders/{id}/generate-documents`

### 4.3 Customer & Discount Management
- **UI Structure:**
  - Advanced Coupon configuration (Discounts applicable specifically on *Making Charges* vs *Total Value*, a standard mechanism in precious metals retail).
- **API Structure:** `GET /api/admin/customers`, `POST /api/admin/coupons`

---

## 5. Partial Admin Pages (To Be Completed)

### 5.1 Product Management (Creation / Edit UI)
- **Current State:** Basic List/Create.
- **UI/API Structure:** Needs a massive, multi-tab form. Essential unique fields:
  - **Jewelry Specs:** Gross Weight, Net Metal Weight, Purity (e.g., 92.5%, 22k), Making Charges (Absolute vs Per Gram factor), Primary Base Metal.
  - **Endpoint:** `POST / PUT /api/admin/products/{id}`

### 5.2 Inventory Management
- **Current State:** Surface level stock visibility.
- **UI/API Structure:** Granular SKU/variant-level (Size-level) stock control. "Low Stock" alerts to dynamically pause out-of-stock sizes.
- **Endpoint:** `PUT /api/admin/inventory/adjust-stock`

---

## 6. Missing Admin Settings (To Be Built)

### 6.1 Logistics & Shipping Configuration
- **UI/API:** Zone-wise base rates. Mandatory configuration for transit insurance thresholds on high-value carts.

### 6.2 Taxation Configuration
- **UI/API:** Flexible tax tiers based on local governance codes, mapped to the material being sold.

### 6.3 Store, Payment, & SEO Settings
- **UI/API:** Complete brand personalization settings, gateway API key configurations, and rich snippet integrations for Google Shopping mapping.

### 6.4 Theme & Branding Customization (Dynamic Theme Changing)
- **UI Structure:**
  - Admin panel tab to switch between curated, minimalist high-end color palettes (e.g., Soft Ocean Teal, Warm Rose Gold, Sleek Icy Silver).
  - Toggles for Light/Dark mode default state.
  - Typography selection (pairing Serif fonts like Cormorant Garamond for headings, and Sans-serif like Inter for body).
- **API Structure:**
  - **Endpoint:** `PUT /api/admin/settings/theme`
  - **Payload:** `{ activePalette: "ocean-teal", mode: "light", headingFont: "Cormorant+Garamond" }`
  - *Note:* The storefront will fetch this payload on startup and apply the CSS variables dynamically (`--primary`, `--background`, etc.) to replace hardcoded values in `index.css`.
