# Backend API Field Mapping & Configuration Reference

This document clarifies the mapping between Backend (MongoDB) field names and Frontend (KV Silver UI) field names. It includes the required implementation steps for backend developers to ensure frontend compatibility.

## Global Configurations

| Configuration | Value | Purpose |
| :--- | :--- | :--- |
| `JSON Payload Limit` | `50MB` | Supports large high-resolution base64 product images in create/update requests. |
| `URL Encoded Limit` | `50MB` | Consistent with JSON limits for form submissions. |

## Product Schema Mapping (Required Transformation)

The backend `Product` model should implement a `toJSON` transform to include frontend-friendly aliases.

| Frontend Field | Backend (Raw) Field | Auto-Mapped? | Notes |
| :--- | :--- | :--- | :--- |
| `category` | `material` | 🕒 Pending | Backend returns `category` mapped from `material`. |
| `inStock` | `isActive` | 🕒 Pending | Backend returns `inStock` mapped from `isActive`. |
| `purity` | `purity` | 🕒 Pending | Should be returned as a `string` (e.g., `"925"`). |
| `id` | `_id` | 🕒 Pending | Standard normalization. |

### Additional Request Field Aliases
The logic in `ProductRepository` currently supports the following aliases during **Create/Update** operations. These should be maintained for backward compatibility:

- `name` ➔ `itemName`
- `productGroupCode` ➔ `productGroup`
- `weight` ➔ `weightGm`
- `material` ➔ `category`

## Filter Query Parameters (Storefront)

When the storefront requests products (e.g., `GET /api/v1/products`), the following filters are used:

| Parameter | Type | Backend Implementation |
| :--- | :--- | :--- |
| `category` | `string` | Maps to `material` field. Supports comma-separated strings. |
| `metal` | `string` | Maps to `purity` field using regex matching. |
| `minPrice` / `maxPrice` | `number` | Used for price range filtering. |
| `onSale` | `boolean` | Checks for `isSale: true` or existence of `originalPrice`. |
| `featured` | `boolean` | Filters for `isFeatured: true`. |
| `search` | `string` | Performs a text search across `name`, `description`, and `material`. |

## Backend Implementation Guide

### 1. Increase Payload Limits
In `src/app.ts`, update the body parser limits to support base64 image uploads:

```typescript
// src/app.ts
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### 2. Implement Product Model Transforms
In `src/models/product.model.ts`, add the `toJSON` transform to the `ProductSchema` options:

```typescript
// src/models/product.model.ts
const ProductSchema = new Schema<IProduct>(
  {
    // ... fields ...
  },
  { 
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        ret.category = ret.material;
        ret.inStock = ret.isActive;
        if (ret.purity) ret.purity = String(ret.purity);
        return ret;
      }
    }
  }
);
```

## API Request Examples

### Updating a Product (with Image)
**Endpoint**: `PUT /api/v1/admin/products/:id`

**Request Body**:
```json
{
  "name": "Wooden Aarathi",
  "category": "Wood + Silver",
  "price": 1250,
  "purity": "925",
  "image": "data:image/jpeg;base64,...(large payload up to 50MB)..."
}
```

## Maintenance
The normalization should be handled in the `kv-api` repository as documented above to keep the frontend logic simple and avoid redundant mapping in the browser.
