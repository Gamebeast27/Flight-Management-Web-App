# ✈️ Flight Management Web App

A production-grade Progressive Web App built with **Next.js 14 (App Router)**, **Supabase**, **Zustand**, and **Tailwind CSS** — enabling users to search flights, book seats, reschedule, and cancel bookings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript strict) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| State | Zustand with persist middleware |
| Styling | Tailwind CSS |
| PWA | @ducanh2912/next-pwa (Workbox) |

---

## Getting Started

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### 2. Clone & Install

```bash
git clone <repo-url>
cd "Flight Management Web App"
npm install
```

### 3. Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>   # server-side only
```

> **Where to find these:** Supabase Dashboard → Project Settings → API

### 4. Apply Database Migrations

Run the SQL files in order via **Supabase Dashboard → SQL Editor**:

| Order | File | Purpose |
|---|---|---|
| 1 | `supabase/migrations/20260521000001_create_tables.sql` | Creates all 5 tables |
| 2 | `supabase/migrations/20260521000002_enable_rls.sql` | Enables RLS + all policies |
| 3 | `supabase/migrations/20260521000003_rpc_reserve_seat.sql` | Atomic reservation RPC |
| 4 | `supabase/migrations/20260521000004_trigger_cancellation_guard.sql` | Cancellation guard trigger |

> Alternatively, if you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked:
> ```bash
> supabase db push
> ```

### 5. Seed the Database

Run `supabase/seed.sql` via Supabase Dashboard → SQL Editor.

This inserts:
- **8 flights** across 4 routes (DEL→BOM, BOM→BLR, DEL→BLR, BOM→HYD)
- **1,168 seats** (146 per flight: Economy rows 1–20, Business 21–25, First 26–28)

### 6. Create the Test User

> ⚠️ Auth users cannot be created via raw SQL. Use the Supabase Dashboard:

1. Go to **Authentication → Users → Invite User** (or Add User)
2. Use these credentials:

| Field | Value |
|---|---|
| Email | `test@flightapp.dev` |
| Password | `TestFlight@123` |

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

```
flights        — flight schedules & pricing
seats          — seat map per flight (economy/business/first)
bookings       — user reservations with PNR code
passengers     — traveller details per booking
reschedules    — reschedule history per booking
```

### Key Business Rules

| Rule | Implementation |
|---|---|
| **Atomic booking** | `reserve_seat()` RPC uses `SELECT FOR UPDATE` — no double-booking |
| **PNR uniqueness** | DB UNIQUE constraint + collision-retry loop in RPC |
| **Cancellation window** | BEFORE UPDATE trigger — rejects if departure < 2 hours away |
| **Data isolation** | RLS ensures users see only their own bookings/passengers/reschedules |

---

## Project Structure

```
├── app/                    # Next.js App Router (Phase 2)
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser client (Client Components)
│       ├── server.ts       # Server client (Server Components, Actions)
│       └── middleware.ts   # Session refresh helper
├── types/
│   └── supabase.ts         # Strict TypeScript DB types
├── supabase/
│   ├── migrations/         # SQL migration files (run in order)
│   └── seed.sql            # Flight + seat seed data
├── public/
│   └── manifest.json       # PWA manifest
├── middleware.ts            # Next.js root middleware (session refresh)
├── next.config.ts           # Next.js + PWA config
└── .env.example             # Environment variable template
```

---

## Verification Checklist

After applying migrations, verify in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';

-- Test the reservation RPC (replace with real UUIDs after seeding)
-- SELECT * FROM public.reserve_seat('<seat_id>', '<user_id>', '<flight_id>');

-- Verify cancellation trigger (should throw error for imminent flights)
-- UPDATE public.bookings SET status = 'cancelled' WHERE id = '<id>';
```

---

## Roadmap

- **Phase 1** ✅ — Infrastructure (current)
- **Phase 2** — UI: search page, seat selector, booking flow, my bookings
- **Phase 3** — Realtime seat availability, notifications, reschedule flow
- **Phase 4** — Admin dashboard, analytics, payment integration
