# Product multiple images — `images` field (write side)

Products can carry **multiple images** shown as a sliding gallery on the collection cards and the
product detail page. The **read** side already exists (`GET /products` returns `images: [{ imageBase64, sortOrder }]`,
see [15-products-pricing-stock.md](15-products-pricing-stock.md)); this documents the **write** side
so the admin panel can save several images per product.

## Read (already supported)

```jsonc
{
  // …product…
  "images": [
    { "imageBase64": "<base64-or-url>", "sortOrder": 0 },
    { "imageBase64": "<base64-or-url>", "sortOrder": 1 }
  ]
}
```

The client sorts by `sortOrder`, normalizes each src (`src/lib/image.ts`), and exposes them as
`product.images: string[]` with `product.image` = the first (primary).

## Write (NEW — required backend work)

`POST /admin/products` and `PUT /admin/products/:id` now send an **`images` array** alongside the
existing `image` field:

```jsonc
{
  // …product…
  "image": "<primary>",          // = images[0]; kept for backward compatibility
  "images": ["<img0>", "<img1>", "<img2>"]
}
```

- `images` is an **ordered array of strings**. `images[0]` is the primary image.
- Each entry is **either** a base64 data URI (a newly uploaded image) **or** an existing image
  reference echoed back from a previous GET (a kept image) — mirroring how the single `image` field
  is already handled on edit. The backend should store new base64 images and keep existing ones.
- `PUT` sends the **complete** desired array (full replace). An empty array clears all images.
- The server should return the saved `images` in the read shape (`[{ imageBase64, sortOrder }]`).

> Backend decision needed: confirm whether to accept `images: string[]` (as the client sends) or
> require the object form `[{ imageBase64, sortOrder }]` on write. The client currently sends
> `string[]`; adjust `adminService`/this doc if the backend prefers objects.

## Client behaviour (already implemented frontend-side)

- **Service** (`src/services/product.ts`): `extractImages()` returns all sorted, normalized images
  as `product.images: string[]`; `product.image` stays the primary.
- **Admin** (`src/pages/Admin.tsx`): `ImagesUploader` — multi-file upload, thumbnail grid with
  remove + "make primary" (reorder), in both create and edit forms. Sends `image` + `images`.
- **Collection card** (`src/components/ProductCard.tsx`) and **detail page**
  (`src/pages/ProductDetail.tsx`): a sliding `ProductImageCarousel` (embla) — swipeable, hover
  arrows, dot indicators. Falls back to a single `<img>` when there is only one image.
