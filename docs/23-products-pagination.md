# Product list pagination — `page` / `limit` (infinite scroll)

The Shop page now uses **infinite scroll** (12 products per batch) to reduce the initial payload and
server load when browsing/filtering/searching. This needs `GET /products` to support pagination.

## Request — new query params

`GET /products` gains two optional params (added alongside the existing
`category`, `metal`, `minPrice`, `maxPrice`, `search`, `sortBy`, `onSale`, `featured`):

| Param | Type | Meaning |
| --- | --- | --- |
| `page` | integer ≥ 1 | 1-indexed page number |
| `limit` | integer | page size (client sends **12**) |

All existing filters apply **before** pagination, so paging is over the filtered/sorted result set.

Example: `GET /products?category=Rings&sortBy=price_asc&page=2&limit=12`

## Response

The client currently consumes the **existing bare array** shape — it just expects **at most `limit`
items per page**:

```jsonc
[ { /* product */ }, { /* product */ }, … ]   // ≤ limit items for this page
```

- Page beyond the last ⇒ return an **empty array** `[]`.
- Items are the same product objects as today (incl. `images`, `variants`, pricing, etc.).

### Preferred (optional) — wrapped shape with total

If convenient, returning a total lets the UI show "Showing X of N" and compute pages exactly:

```jsonc
{ "items": [ /* … ≤ limit */ ], "total": 137, "page": 2, "limit": 12 }
```

If you adopt this, tell the frontend so `productService.getProducts` can read `items`/`total`
(today it reads a bare array).

## Client behaviour (already implemented frontend-side)

- **Service** (`src/services/product.ts`): `ProductFilters` gained `page?` / `limit?`, appended to the
  query string like other filters.
- **Shop** (`src/pages/Shop.tsx`): `useInfiniteQuery` with `initialPageParam: 1`, `PAGE_SIZE = 12`.
  An `IntersectionObserver` sentinel (`rootMargin: 400px`) auto-fetches the next page near the bottom;
  a spinner shows while loading. Filter/search/sort changes reset the query (new query key → page 1).
- **Graceful degradation:** until the backend paginates, it returns the full array. The client treats
  a page **larger than `limit`** (or a repeat of already-seen ids) as "no more pages", so it shows
  everything **once** with no duplicate fetches. Results flatten + de-dupe by `id`.

## Not yet wired (backend)

Add `page`/`limit` handling (and ideally `total`) to `GET /products`. Until then infinite scroll is a
no-op (one full page) — no breakage. See also `09-api-changes-and-fixes.md`.
