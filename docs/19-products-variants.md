# Product size/weight variants — `variants` field

Adds an optional `variants` array to a product so a single product can offer several
sizes (think dress sizes **S–XXL**), each with its own **weight**, **height** and **breadth**.

- **weight** — will drive the per-variant total/price calculation (next phase). Required per row.
- **height / breadth** — display-only, shown to the customer for understanding. Optional.
- **label** — free-text size name (e.g. `S`, `Small`, `20g`). Required per row.

Backend must persist and echo this field. All fields are strings (free-text, like the existing
`weight`/`purity` fields) — no server-side unit parsing required for this phase.

## Shape

```jsonc
{
  // …existing product fields…
  "variants": [
    { "label": "S",   "weight": "20g", "height": "2cm", "breadth": "1cm" },
    { "label": "M",   "weight": "30g", "height": "3cm", "breadth": "2cm" },
    { "label": "XXL", "weight": "55g", "height": "6cm", "breadth": "4cm" }
  ]
}
```

`label` and `weight` are required per entry; `height` and `breadth` are optional and may be
omitted/empty. When a product has no variants the field is absent or `[]`.

## Endpoints

| Endpoint | Direction | Notes |
| --- | --- | --- |
| `GET /products` | response | bare array; each product may carry `variants` |
| `GET /products/:id` | response | bare object; may carry `variants` |
| `POST /admin/products` | request + response | accepts `variants`; persists and echoes it |
| `PUT /admin/products/:id` | request + response | full replace of the `variants` array |

`PUT` sends the **complete** desired array — the client does not patch individual rows. An empty
array clears all variants.

## Client behaviour (already implemented frontend-side)

- **Normalization** (`src/services/product.ts`): empty rows (no `label` and no `weight`) are
  dropped; the field becomes `undefined` when nothing remains. Values are trimmed.
- **Admin** (`src/pages/Admin.tsx`): create + edit product forms have a `VariantsEditor` to add /
  remove rows. Empty rows are stripped (`cleanVariants`) before the request.
- **Product detail** (`src/pages/ProductDetail.tsx`): renders a size selector; the selected
  variant's weight/height/breadth populate the Specifications block. Display only — does **not**
  yet affect the cart price (see next phase).
- **Collections card** (`src/components/ProductCard.tsx`): lists the available weights joined with
  ` / ` (e.g. `20g / 30g / 40g`).

## Not yet wired (next phase)

The selected variant's **weight** will feed the cart/checkout total. That requires the
create-order / verify payloads to carry the chosen variant (label or index) so the server can
price it authoritatively. Tracked separately — see `API_CHANGES_AND_FIXES.md`.
