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

Create a `.env` file at the root:

```
VITE_API_URL=http://localhost:5000/api/v1
```

Falls back to `http://localhost:5000/api/v1` when absent. The `VITE_API_URL` origin is also used by `src/lib/image.ts` to resolve server-relative image paths.

## Architecture

**React 18 + Vite + TypeScript** SPA. Path alias `@/` maps to `src/`.

### Provider tree (top-down in `App.tsx`)

```
QueryClientProvider (TanStack Query — staleTime 30s, retry 1)
  AuthProvider
    CartProvider
      TooltipProvider
        BrowserRouter
          Marquee + Navbar (fixed header, 112px offset applied to <main>)
          <Routes>
          Footer
```

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

One file per domain, each consuming `api` from `src/lib/api`. Key ones: `auth`, `product`, `cart`, `order`, `payment`, `coupon`, `silverRate`, `admin`.

### Image handling (`src/lib/image.ts`)

`normalizeImageSrc()` converts every image value from the API (raw base64, data URI, absolute URL, server-relative path) into a usable `<img src>` string. Always pass API image values through this function before rendering.

### UI components (`src/components/ui/`)

Auto-generated Shadcn/UI primitives — do not edit manually; use the Shadcn CLI. Custom components live in `src/components/`.

### Testing

Vitest + @testing-library/react in jsdom. Setup file: `src/test/setup.ts` (imports jest-dom matchers, stubs `window.matchMedia`).

Service tests mock `src/lib/api` via `vi.mock('../lib/api', ...)` and assert on the arguments passed to `api.get/post/put/delete`. Follow this pattern for new service tests.
