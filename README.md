# GEC Exchange (Campus Exchange)

Marketplace exclusively for **Goa College of Engineering** students to buy and sell used academic equipment, electronics, books, and hostel items.

No online payments — students list items and buyers chat with the seller on WhatsApp in one tap.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** Auth (Google OAuth) + Storage
- **PostgreSQL** via **Drizzle ORM**
- **Playwright** for end-to-end testing
- Deploy: **Vercel**

## Features (MVP)

- Google login
- Profile setup (branch, year, WhatsApp)
- Marketplace with search + category filters
- Create / edit / soft-delete listings
- Image upload to Supabase Storage
- GEC-only login (`@gec.ac.in` Google accounts)
- One-tap "Chat on WhatsApp" that puts the item on hold and hides it from the marketplace
- Relist link inside the WhatsApp message if the deal falls through
- No notifications or emails; untouched listings quietly hide after 30 days
- Mark item sold
- Seller dashboard (overview, listings, interested buyers, profile)

## Quick start

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. **Authentication → Providers → Google**: enable and add OAuth client credentials
3. **Authentication → URL configuration**: add redirect URL  
   `http://localhost:3000/auth/callback` (and your production URL later)
4. **Storage**: create a public bucket named `listing-images`
5. Copy API keys + database URL into `.env.local`

### 3. Database

```bash
# Push schema to Supabase Postgres
npm run db:push

# Optional demo data
npm run db:seed
```

Or run the SQL in `db/migrations/0000_init.sql` in the Supabase SQL editor.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional alternate public key name |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `DATABASE_URL` | Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | App origin (`http://localhost:3000`) |
| `CRON_SECRET` | Secret Vercel Cron sends to `/api/cron/listings` (set in Vercel project env) |
| `E2E_TEST_MODE` | Enables the test-only login route |

## Scripts

```bash
npm run dev          # development
npm run build        # production build
npm run start        # start production server
npm run db:push      # sync Drizzle schema
npm run db:generate  # generate migrations
npm run db:seed      # seed demo listings
npm run db:studio    # Drizzle Studio
npm run test:e2e     # Playwright end-to-end tests
```

### End-to-end testing

Set `E2E_TEST_MODE=true` when running the Playwright suite. In that mode:

- a test-only login route can set a session cookie for seeded demo users
- contact, reserve/sell, report, and cron flows can be exercised safely

## Project structure

```
app/           # Routes (pages only)
actions/       # Server Actions (mutations)
components/    # UI components
db/            # Schema, queries, migrations, seed
lib/           # Auth, Supabase, validation, WhatsApp links
types/         # Shared TypeScript types
utils/         # Pure helpers
docs/          # PRD, architecture, tasks
```

## Core flow

No notifications, and sellers never have to check the site.

```
Student lists item
  → Buyer taps "Chat on WhatsApp"
       ├ the item goes ON HOLD for that buyer (hidden from the marketplace)
       └ WhatsApp opens with a pre-filled message to the seller:
           "GEC Exchange has hidden this item while we talk.
            If our deal doesn't work out, put it back here: <link>/relist"
  → Students meet on campus and pay in person
  → Deal done: nothing to do (it stays hidden). Optionally tap "Mark sold".
  → Deal fell through: seller taps the relist link (sign-in required)
```

- A buyer can have at most **2 items on hold** at once, and contact at most 15 new sellers a day.
- If two buyers tap at the same moment, only one gets the hold. The other sees
  "Someone is already talking to the seller".
- **Silent safety net:** a daily Vercel Cron (`vercel.json` → `/api/cron/listings`, protected by
  `CRON_SECRET`) hides live listings nobody has touched in 30 days (for items sold outside the
  app). Sellers can relist from their dashboard.

## Docs

- [PRD](./docs/PRD.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Tasks](./docs/TASKS.md)

## License

See [LICENSE](./LICENSE).
