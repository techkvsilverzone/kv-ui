# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-03

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** kv-silver-zone
- **Description:** Premium Silver selling eCommerce Platform
- Password changes use `PUT /users/:userId/password` with body `{ newPassword }`, and UI should map status codes 400/403/404 to user-facing validation messages.
- Admin user-management actions can be role-gated inside `src/pages/Admin.tsx` using `role === 'admin'`, while staff may still access other admin tabs.
- Storefront theme should be fetched from public `GET /store-config` on app startup, with localStorage only as fallback.
- Admin theme management should read from `GET /admin/store-config` and update through `/admin/store-config` (PUT with POST fallback for compatibility).

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
- [2026-04-05] Implemented a dedicated `ChangePassword` page for normal users and a separate admin-only modal action in the customers table, both hitting the same endpoint for consistent backend behavior.
- [2026-04-05] Switched theme persistence to backend store-config endpoints for both public app initialization and admin save flow.
