# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.

---

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173

# Build
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build

# Lint
npm run lint         # ESLint

# Tests
npm test             # Run all tests once (vitest run)
npm run test:watch   # Watch mode

# Run a single test file
npx vitest run src/services/auth.test.ts
```

## Environment

Create a `.env` file at the root (see `.env.example`):

```
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=        # Razorpay publishable key (client-side)
VITE_SENTRY_DSN=             # optional — enables Sentry error monitoring
VITE_GA4_ID=                 # optional — enables GA4 page/event tracking
```

`VITE_API_URL` falls back to `http://localhost:5000/api/v1` when absent; its origin is also used by `src/lib/image.ts` to resolve server-relative image paths. All `VITE_*` vars are bundled into the client (public by design — no server secrets). Analytics/monitoring (`src/lib/analytics.ts`) is a no-op when its keys are blank.

Auth uses an **httpOnly cookie** (not localStorage): `src/lib/api.ts` sends `credentials: 'include'` on every request; logout calls `POST /auth/logout`. For cross-origin deploys the server needs `SameSite=None; Secure` cookies and an explicit CORS allowlist.

End-to-end tests use Playwright (`npm run test:e2e`; first run needs `npx playwright install chromium`). Tests live in `e2e/` (outside `src/`, so vitest ignores them).

## Architecture

**React 18 + Vite + TypeScript** SPA. Path alias `@/` maps to `src/`.

### Provider tree (top-down in `App.tsx`)

```
QueryClientProvider (TanStack Query — staleTime 30s, retry 1)
  AuthProvider
    CartProvider
      TooltipProvider
        BrowserRouter
          Marquee + Navbar (fixed header, offset applied to <main>)
          <Routes>
          Footer
```

`<main>`'s top padding is route-dependent: `pt-[72px]` on `/admin*` (Navbar only), `pt-[112px]` elsewhere (Marquee + Navbar). All routes are declared flat in `AppContent` (`App.tsx`) — there is no route-level auth wrapper; pages self-guard (see below).

### Roles & access control

`getUserRole(user)` in `AuthContext.tsx` normalises a user to `'admin' | 'staff' | 'customer'`, preferring `user.role`, then falling back to `user.isAdmin`, else `'customer'`. The admin panel is **not** protected at the router; `Admin.tsx` self-guards by returning `<Navigate to="/login" />` unless the user is `admin` or `staff`, and gates individual TanStack queries with `enabled: role === 'admin'` (or `admin`/`staff`). Some sections are admin-only while staff see a reduced view (`isStaffOnly`). Replicate this `enabled`-gating pattern when adding admin data.

### Runtime theming

`App.tsx` fetches `storeConfigService.getPublicStoreConfig()` on mount and applies it via `applyTheme()`, which toggles the `dark` class and overrides the `--primary` / `--ring` CSS vars from `colorThemeCssVars` (`ocean-teal`, `rose-gold`, `icy-silver`, `deep-amethyst`). The config is cached in `localStorage` as `kv-theme-config` and used as the offline fallback. Admins change these values through the store-config section of the admin panel.

### State management

- **Auth** — `src/context/AuthContext.tsx`. JWT and user stored in `localStorage` as `kv-silver-token` / `kv-silver-user`. On mount, the stored token is validated with `GET /users/me`. A global `kv-auth-unauthorized` DOM event (fired by the API layer on 401) silently clears the session.
- **Cart** — `src/context/CartContext.tsx`. Guest carts persist in `localStorage` (`kv-silver-cart`). On login the guest cart is merged into the server cart. Mutations are optimistic (local state first, then fire-and-forget API call tracked per-item with `pendingProductIds`).

### API layer (`src/lib/api.ts`)

Thin `fetch` wrapper (`api.get/post/put/delete`) that:
- Attaches `Authorization: Bearer <token>` from localStorage.
- Throws typed `ApiError(statusCode, message)` on non-2xx responses.
- Fires `kv-auth-unauthorized` event on 401.
- Returns `{}` for 204 No Content.

### Services (`src/services/`)

One file per domain, each consuming `api` from `src/lib/api` and exporting a typed `*Service` object plus its DTO interfaces. Domains: `auth`, `product`, `cart`, `order`, `payment`, `coupon`, `silverRate`, `admin`, `inventory` (stock inward/outward/reconcile), `storeConfig`, `returns`, `review`, `savings`, `wishlist`, `contact`.

### Admin panel (`src/pages/Admin.tsx`)

A single monolithic page (~26k tokens) that hosts every admin/staff feature (orders, products, users, coupons, silver rate, inventory, store config, etc.) as in-page tabs/sections rather than nested routes. When adding admin functionality, extend this file and wire a new role-gated `useQuery`/`useMutation` rather than creating a new route.

### Image handling (`src/lib/image.ts`)

`normalizeImageSrc()` converts every image value from the API (raw base64, data URI, absolute URL, server-relative path) into a usable `<img src>` string. Always pass API image values through this function before rendering.

### UI components (`src/components/ui/`)

Auto-generated Shadcn/UI primitives — do not edit manually; use the Shadcn CLI. Custom components live in `src/components/`.

### Testing

Vitest + @testing-library/react in jsdom. Setup file: `src/test/setup.ts` (imports jest-dom matchers, stubs `window.matchMedia`).

Service tests mock `src/lib/api` via `vi.mock('../lib/api', ...)` and assert on the arguments passed to `api.get/post/put/delete`. Follow this pattern for new service tests.
