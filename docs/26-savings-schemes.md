# Savings Schemes (multi-scheme-type rework)

## Why

The app used to model exactly one savings product — a silver-only, gram-accumulation
installment scheme — even though the shop actually runs five distinct products (see the
printed scheme cards in `docs/cards/`). This rework introduces a proper scheme **catalog**
(`SchemePlan`) and generalizes enrollment/payment/passbook to work across scheme types.

**Phase 1 (this doc) covers the three self-service, installment-based schemes**:

| Type | Metal | Duration | Bonus | Redemption |
|---|---|---|---|---|
| `GOLD_11_1` | Gold | 11 months | 1 bonus month, auto-credited | Goods only, at maturity market rate |
| `SILVER_11_1` | Silver | 11 months | 1 bonus month, auto-credited | Goods only, at maturity market rate |
| `DIWALI` | — (value-based hamper) | 11 months | 1 bonus month, credited in kind | Fixed gifts + silver coin + gold worth the remainder, at redemption-day rate |

Two more types exist in the type system (`GOLD_INCOME`, `SILVER_DEPOSIT` — lump-sum deposit
schemes with a fixed monthly cash income / graduated maturity bonus respectively) but are
**not yet enrollable** — reserved for a later phase.

## Data model

### `SchemePlan` (`kv-api/src/models/schemePlan.model.ts`)

The admin-editable catalog — one document per `type`. Public `GET /scheme-plans` returns only
`isActive: true` plans; admin CRUD is `GET/POST/PUT/DELETE /admin/scheme-plans` (`admin`-only,
no staff UI — these define money rules).

Key fields: `type`, `name`, `description`, `isActive`, `metal?` (`GOLD`|`SILVER`, unset for
Diwali), `durationMonths`, `bonusMonths`, `monthlyAmounts: number[]` (fixed denominations —
customers pick one, not a free-text amount), `passbookPrefix` (e.g. `GLD`/`SLV`/`DIW`),
`paymentDueDayOfMonth` (10), `earlyExitPenaltyPercent` (10), `maxConsecutiveMissedMonths`
(Diwali only, 3), `redemptionMode` (`GOODS_ONLY`), `hamper?` (Diwali only —
`{goldCoinPurity, silverCoinGrams, giftsValue, gifts[]}` — note there's no `goldCoinGrams`;
gold is a computed value, see below).

Seed script: `npm run seed:scheme-plans` (dry run) / `-- --apply` in `kv-api`. Idempotent —
only creates a plan whose `type` doesn't already exist, and only backfills legacy `Savings`
docs missing `schemeType` (stamps them `SILVER_11_1`, the only scheme that existed before).

### `Savings` (`kv-api/src/models/savings.model.ts`)

Gained `schemeType`, `planId` (the `SchemePlan` this enrollment was created against),
`metal?`. `status` gained `'Dropped'` (Diwali auto-removal after missed payments — distinct
from a customer-initiated `Cancelled`). Payment rows gained `method` (`ONLINE`|`CASH`),
`razorpayOrderId`/`razorpayPaymentId`, `recordedBy` (staff/admin id for cash rows),
`dueMonthKey` (IST `YYYY-MM` the collection was actually made in — enforces "one installment
per calendar month", card rule 3).

New `cancellation?` (set once, on early exit — card rule 6): `{cancelledAt,
amountPaidAtCancellation, penaltyPercent, penaltyAmount, giftsValueDeducted, netRedeemable,
note, cancelledBy}`. `netRedeemable` is goods-only — there's no cash refund path anywhere in
this feature.

`maturityBenefits` gained `goldGrams`/`goldRatePerGram`/`silverValue`/`silverRatePerGram`/
`giftsValue`/`computedAt` alongside the existing `goldCoinValue`/`silverGrams`/`gifts` — see
the Diwali redemption formula below, which populates all of these at once.

As before, **grams/totals are never stored** — `PassbookView.tsx`
(`buildLedgerRows`) and the admin Ledger dialog always re-derive Total/Cumulative from the raw
per-row fields at render time.

## Business rules implemented

- **Passbook numbering**: per-scheme-type series, `{prefix}-{financialYearCode}-{7-digit seq}`
  (e.g. `GLD-2627-0000012`). Each prefix counts only passbooks already issued under that same
  prefix. Pre-rework passbooks (bare `2425-0000111`, no prefix) are untouched.
- **One installment per calendar month** (card rule 3): `SavingsService.applyPayment` rejects a
  second real payment whose `dueMonthKey` (IST month of the collection) matches an existing row.
- **Late payment pushes maturity out** (card rule 2): `SavingsService.getMaturityDate` computes,
  at read time, whichever is LATER of the originally scheduled `start + duration months` or
  `last real payment + remaining installments`. Never stored — exposed as `maturityDate` on
  `GET /savings/my-schemes`, `/admin/savings`, and `/savings/passbook/:passbookNumber`.
- **Early-exit forfeit** (card rule 6): `POST /admin/savings/:id/cancel` (admin-only) computes
  `penaltyAmount = totalPaid × plan.earlyExitPenaltyPercent / 100`, subtracts an admin-entered
  `giftsValueDeducted`, floors `netRedeemable` at 0. Goods-only — no money moves.
- **Diwali drop-out** (card rule 2, festival-specific): the daily reminder cron
  (`SavingsReminderService`) flips a Diwali scheme to `Dropped` once its unpaid gap reaches
  `plan.maxConsecutiveMissedMonths`, and sends a WhatsApp notice.
- **Metal-aware rate resolution**: `PricingService.getCurrentRatePerGram(metal)` generalizes
  what was silver-only logic; `getCurrentSilverRatePerGram()` now delegates to it. Gold 11+1
  installments and the Diwali redemption's gold portion both resolve against the real gold rate.
  Diwali installments themselves resolve **no** rate at all — `scheme.metal` is intentionally
  unset for Diwali, and `applyPayment` only resolves/requires a rate `if (metal)`. An earlier
  version defaulted the unset metal to `'SILVER'`, which silently required a live silver rate
  to record ANY Diwali collection and stored meaningless `materialRate`/`materialWeight` on
  every row — fixed; see `savings-lifecycle.test.ts`.
- **Notifications**: `sendDiwaliSchemeCompleted` alerts the ops WhatsApp number the moment a
  Diwali scheme collects its final installment (redemption isn't automatic — unlike Gold/Silver
  11+1's bonus grams, an admin must trigger the compute manually). `sendDiwaliRedemptionReady`
  notifies the customer once that compute has run.
- **Diwali redemption payout** (business rule confirmed by the owner with a worked example:
  ₹3,000/mo × 11 = ₹33,000 paid → ₹32,000 gold + ₹2,500 gifts + a 30g silver coin — total
  VALUE handed back is ₹36,000, i.e. paid + 1 bonus month, the same "+1" pattern as Gold/Silver
  11+1, just credited in kind instead of as a ledger row):
  ```
  totalValue = totalPaid + monthlyAmount          (1 bonus month's worth)
  silverValue = plan.hamper.silverCoinGrams × silverRate
  goldValue  = totalValue − plan.hamper.giftsValue − silverValue
  goldGrams  = goldValue / goldRate
  ```
  Gold is a fixed ₹ **value**, not a fixed weight — it converts to however many grams that
  buys at the rate on the day of redemption, so the payout is fair regardless of how gold moved
  between enrollment and Diwali. **No customer top-up or KV refund is ever needed** — this
  design deliberately replaced an earlier "price-band top-up/refund" mechanism once the real
  rule was confirmed, precisely because the value-based approach makes that unnecessary.
  `POST /admin/savings/:id/redemption/compute` (admin-only) requires the scheme to have
  completed all its installments; result is stored on `maturityBenefits`, the same field
  Gold/Silver 11+1 use for their admin-configurable maturity reward.

## Access control

- `POST /admin/savings/:id/pay` (manual/offline collection) is now **staff + admin** (was
  admin-only) — business decision: staff can record cash collections. Editing/deleting a
  scheme or a ledger row (`PUT`/`DELETE /admin/savings/:id[/payments/:index]`), cancellation,
  and redemption compute all remain **admin-only**.
- Scheme-plan CRUD (`/admin/scheme-plans`) is admin-only, no staff UI — same tier as
  gift-vouchers/pricing-config (financially sensitive, no staff-facing UI need).

## Client files

| Concern | Files |
|---|---|
| Scheme catalog | `src/services/schemePlan.ts`, `src/services/admin.ts` (`getAllSchemePlans`/`create`/`update`/`deleteSchemePlan`) |
| Enrollment + self-pay | `src/services/savings.ts`, `src/pages/SavingsScheme.tsx` |
| Passbook display | `src/components/PassbookView.tsx` (metal-aware ledger for 11+1 schemes; a separate Diwali layout — Month/Date/Amount table + redemption hamper — for `schemeType === 'DIWALI'`) |
| Admin management | `src/pages/Admin.tsx` (Savings tab: type/metal columns, cancel action, Diwali redemption-compute action; new Scheme Plans management card) |
| Dashboard/profile summaries | `src/pages/CustomerDashboard.tsx`, `src/pages/Profile.tsx` |

## Not yet built (phase 2)

`GOLD_INCOME` (Gold Monthly Income Scheme) and `SILVER_DEPOSIT` (Silver Maturity Deposit
Scheme) — lump-sum deposit products with a fixed monthly cash income / graduated
early-withdrawal bonus respectively. Both are already in the `SchemeType` enum and the
`Savings`/`SchemePlan` models are shaped to accommodate them without another migration, but no
plan is seeded and `SavingsService.enroll` explicitly rejects enrolling in either today.
