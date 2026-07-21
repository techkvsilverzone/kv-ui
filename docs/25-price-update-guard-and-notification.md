# 25 — Daily Price-Update Guard & WhatsApp Notification

**Status:** Frontend + Backend implemented (B1–B4 live)
**Owner:** API team
**Related frontend:** `src/lib/rateFreshness.ts`, `src/components/RateUpdateGate.tsx`, `src/pages/Admin.tsx`, `src/services/goldRate.ts`, `src/services/silverRate.ts`, `src/services/rateStatus.ts`

## Goal

Make the daily silver **and gold** rate a mandatory update. Every morning by **10:00 IST**:

1. If today's rate has **not** been recorded (still yesterday's or older):
   - **Block the admin panel** for `admin` and `staff` users (customers are unaffected — they cannot reach it).
   - **Send a WhatsApp reminder** to **+91 88256 49680**.
2. The block clears automatically the moment today's rate is saved.
3. **Sunday is exempt** — no rate update is required that day. The lock never engages on
   Sunday (IST) and no WhatsApp reminder is sent, regardless of how stale the last recorded
   rate is.

Timezone is **Asia/Kolkata (IST)** for both the cron and the "today"/"Sunday" comparison.

---

## Part A — Frontend (done in this repo)

- `src/lib/rateFreshness.ts` — pure rule: a metal is *stale* if, at/after `RATE_UPDATE_CUTOFF_HOUR` (10), its latest rate record is not dated today. Before 10am nothing is blocked (grace period). On Sunday (`isRateUpdateExemptDay`) nothing is ever blocked, before or after the cutoff.
- `Admin.tsx` fetches `/admin/silver-rates` and `/admin/gold-rates`, computes the block, and renders `RateUpdateGate` (with inline rate-update forms so admins can unblock themselves). A 1-minute ticker re-evaluates so the lock engages at 10am without a reload.
- **Gold degrades gracefully:** the gold query has `retry: false`. Until the gold endpoints below exist, the request errors, gold is marked *source unavailable*, and it is skipped — only silver is enforced. As soon as the endpoints ship, gold is automatically enforced too.

> The client-side block is a UX guard. **The server must still enforce authorization** — i.e. the 10am cron and the WhatsApp alert are the source of truth, and admin write endpoints should not depend on the client honoring the lock.

---

## Part B — Backend (to implement)

### B1. Gold-rate endpoints (mirror the existing silver-rate endpoints)

The frontend already calls these (`src/services/goldRate.ts`). Mirror the silver-rate
controller/model exactly, swapping the collection:

| Method | Path | Auth | Notes |
| ------ | ---- | ---- | ----- |
| `GET`  | `/gold-rates/today` | public | today's gold rate(s) |
| `GET`  | `/gold-rates/history?days=30` | public | recent history |
| `POST` | `/admin/gold-rates` | admin/staff | body `{ ratePerGram: number, purity: string }`; sets `date = now (IST)`, derives `ratePerKg`, stamps `updatedBy` |
| `GET`  | `/admin/gold-rates` | admin/staff | all gold rates |

Record shape (same as silver): `{ id, date, ratePerGram, ratePerKg, purity, updatedBy?, createdAt? }`.

### B2. Daily 10:00 IST cron

Pseudocode:

```
cron("0 10 * * *", tz="Asia/Kolkata"):
  if isSunday(nowIST):
    setRateBlockFlag(blocked=false, staleMetals=[])
    return   # Sunday is exempt — no update required, no reminder sent
  today = startOfDay(nowIST)
  staleMetals = []
  for metal in ["silver", "gold"]:
    latest = latestRateRecord(metal)          # by date desc
    if latest is null or latest.date < today:
      staleMetals.push(metal)
  if staleMetals not empty:
    setRateBlockFlag(blocked=true, staleMetals)   # optional, see B4
    sendWhatsApp(to="+918825649680", metals=staleMetals)
  else:
    setRateBlockFlag(blocked=false, staleMetals=[])
```

### B3. WhatsApp send

Use WhatsApp Cloud API (Meta) or Twilio. Suggested env vars:

```
WHATSAPP_PROVIDER=meta            # or "twilio"
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=                # Meta sender id (or Twilio "from")
RATE_ALERT_RECIPIENT=+918825649680
```

Message template (example):

> ⚠️ KV Silver Zone: Today's **{metals}** rate has not been updated. The admin panel is
> locked for admin/staff until it is recorded. Please update it now.

Use an approved template if sending outside the 24-hour customer-care window.

### B4. Authoritative block flag — **shipped**

The cron persists a single-doc `RateStatus` flag, exposed at:

```
GET /admin/rate-status  →  { blocked: boolean, staleMetals: ("silver"|"gold")[], checkedAt: ISO }
```

**Frontend wiring (`src/services/rateStatus.ts` + `Admin.tsx`):**

- `Admin.tsx` reads `/admin/rate-status` (polled every 60s) and **prefers it** over the
  client-side rule, which remains the offline fallback (`computeRateBlock`).
- The flag is the **trigger authority** (IST-correct), but it is only recomputed by the cron.
  So `resolveRateBlock` (in `rateFreshness.ts`) reconciles it with the freshest client rate
  data: a server-stale metal is **dropped the instant the client's latest record for it is
  dated today**, so saving a rate via the gate unlocks immediately without waiting for the
  next cron run.
- Because the flag only updates once a day, a `blocked: true` set by yesterday's cutoff would
  otherwise persist into the next day's grace period (00:00 up to today's cutoff hour) until
  today's cron finally runs at 10am — incorrectly locking the panel overnight. `resolveRateBlock`
  re-applies the same cutoff-hour grace check as `isMetalStale`: before the cutoff, today is
  never blocked, regardless of what the (possibly stale) flag says.
- `/admin/rate-status` is **admin-only**; the query is `enabled` for `admin` only. Staff fall
  back to the client-side rule (which reads the same `/admin/silver-rates` / `/admin/gold-rates`
  they already load).

### Backend implementation notes (as built)

- **Gold response** carries both `date` and `rateDate`; **silver** emits `rateDate`. Both
  frontend services normalize `date ?? rateDate ?? createdAt` so the freshness math is correct
  regardless of which field the server sends.
- **Purity** is pinned server-side (silver `999`, gold `916` / 22K hallmark). The POST `purity`
  is accepted but not persisted as a free string (`MetalRate` stores karat, not a purity label).
  The frontend does not rely on round-tripping an arbitrary purity.
- **Auth**: admin rate + rate-status endpoints use the existing `protect` + `admin` guard
  (isAdmin only — no staff carve-out, same as delivery-config). The spec asks for admin **and**
  staff; granting staff access is a separate backend change affecting all `/admin/*` routes. Until
  then, staff are still *shown* the lock (client-side rule) but cannot update rates through it.

---

## Acceptance

- [x] Gold-rate endpoints live; `Admin.tsx` enforces gold (now via the authoritative flag).
- [x] At 10:00 IST with no today-rate, admin see the lock and a WhatsApp lands at +918825649680.
- [x] Saving today's rate clears the lock immediately (`resolveRateBlock` clears on fresh client data).
- [x] Customers are never blocked (gate is admin-panel-only).
- [x] Sunday (IST) is exempt — no lock, no WhatsApp reminder — even with a stale rate past the cutoff.
- [ ] Staff carve-out: staff can reach + clear the rate lock (needs `/admin/*` middleware staff check).
