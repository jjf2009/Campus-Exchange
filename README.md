# GEC Exchange (Campus Exchange)

Marketplace exclusively for **Goa College of Engineering** students to buy and sell used academic equipment, electronics, books, and hostel items.

No online payments — students list items, request them, and connect on WhatsApp after the seller accepts.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** Auth (Google OAuth) + Storage
- **PostgreSQL** via **Drizzle ORM**
- **Resend** (optional email notifications)
- **Playwright** for end-to-end testing
- Deploy: **Vercel**

## Features (MVP)

- Google login
- Profile setup (branch, year, WhatsApp)
- Marketplace with search + category filters
- Create / edit / soft-delete listings
- Image upload to Supabase Storage
- Request to buy → accept / reject
- Reveal seller WhatsApp only after acceptance
- Mark item sold
- Seller dashboard (overview, listings, requests, profile)

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
| `RESEND_API_KEY` | Optional — emails for accept/reject |
| `E2E_TEST_MODE` | Enables test-only login + mock email transport |

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
- email notifications are captured locally instead of calling Resend
- request, listing, notification, and acceptance flows can be exercised safely

## Project structure

```
app/           # Routes (pages only)
actions/       # Server Actions (mutations)
components/    # UI components
db/            # Schema, queries, migrations, seed
lib/           # Auth, Supabase, validation, email
types/         # Shared TypeScript types
utils/         # Pure helpers
docs/          # PRD, architecture, tasks
```

## Core flow

```
Student lists item
  → Another student requests it
  → Owner accepts one buyer
  → Buyer gets WhatsApp number
  → Students coordinate offline
  → Owner marks item sold
```

## Docs

- [PRD](./docs/PRD.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Tasks](./docs/TASKS.md)

## License

See [LICENSE](./LICENSE).
