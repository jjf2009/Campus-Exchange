# GEC Exchange
# Development Roadmap

Version 1.0

---

# Development Rules

Before starting any task

✔ Read PRD.md

✔ Read ARCHITECTURE.md

✔ Complete only ONE task

✔ Verify task works

✔ Commit changes

✔ Move to next task

Never work on multiple tasks simultaneously.

---

# Milestone 1

Foundation

---

## Task 1

Initialize Project

Goal

Create the project structure.

Requirements

- Next.js 15
- TypeScript
- Tailwind
- shadcn/ui
- ESLint
- Prettier

Deliverables

Running application

---

## Task 2

Install Dependencies

Install

- Drizzle ORM
- Drizzle Kit
- Supabase
- Zod
- React Hook Form
- React Email
- Resend
- Lucide
- Sonner
- date-fns

Acceptance Criteria

Application starts successfully.

---

## Task 3

Configure Environment Variables

Create

.env.local

Configure

SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

DATABASE_URL

RESEND_API_KEY

NEXT_PUBLIC_APP_URL

Acceptance Criteria

Environment loads correctly.

---

## Task 4

Configure Drizzle ORM

Goal

Connect Drizzle to Supabase PostgreSQL.

Deliverables

drizzle.config.ts

db/index.ts

Acceptance

Database connection successful.

---

## Task 5

Create Database Schema

Tables

users

listings

purchase_requests

Generate migration.

Run migration.

Acceptance

Tables exist.

---

## Task 6

Seed Database

Insert

Demo users

Demo listings

Acceptance

Marketplace contains sample data.

---

# Milestone 2

Authentication

---

## Task 7

Google Login

Configure

Supabase OAuth

Acceptance

Login works.

---

## Task 8

Session Management

Protect

Dashboard

Marketplace

Profile

Acceptance

Guests redirected.

---

## Task 9

Profile Completion

Collect

Branch

Year

Phone

Acceptance

Profile saved.

---

# Milestone 3

Marketplace

---

## Task 10

Marketplace Layout

Build

Navbar

Search

Categories

Grid

Acceptance

Responsive.

---

## Task 11

Listing Card

Display

Image

Title

Price

Category

Condition

Acceptance

Cards responsive.

---

## Task 12

Listing Detail

Create

/listing/[id]

Acceptance

Product information visible.

---

## Task 13

Search

Search by

Title

Acceptance

Instant filtering.

---

## Task 14

Category Filter

Acceptance

Filters work.

---

# Milestone 4

Listing Management

---

## Task 15

Create Listing

Build form.

Upload image.

Save listing.

Acceptance

Listing appears.

---

## Task 16

Image Upload

Upload to

Supabase Storage

Acceptance

Images display correctly.

---

## Task 17

Edit Listing

Acceptance

Owner can edit.

---

## Task 18

Delete Listing

Soft delete.

Acceptance

Listing disappears.

---

# Milestone 5

Purchase Requests

---

## Task 19

Create Request

Buyer requests item.

Acceptance

Request stored.

---

## Task 20

Incoming Requests

Seller dashboard.

Acceptance

Requests visible.

---

## Task 21

Accept Request

Acceptance

Buyer unlocked.

---

## Task 22

Reject Request

Acceptance

Rejected correctly.

---

## Task 23

Reveal Phone

Acceptance

Visible only after acceptance.

---

## Task 24

Mark Sold

Acceptance

Removed from marketplace.

---

# Milestone 6

Dashboard

---

## Task 25

Overview

Cards

Listings

Sold

Pending

---

## Task 26

My Listings

Acceptance

Shows listings.

---

## Task 27

Requests

Acceptance

Incoming requests.

---

## Task 28

Profile

Acceptance

Editable.

---

# Milestone 7

Polish

---

## Task 29

Loading States

Skeletons

Buttons

Spinners

---

## Task 30

Empty States

Marketplace

Dashboard

Requests

---

## Task 31

Validation

Zod

Acceptance

Server validation works.

---

## Task 32

Authorization

Verify ownership.

Acceptance

Unauthorized blocked.

---

## Task 33

Error Handling

Acceptance

Friendly messages.

---

## Task 34

Emails

Accepted

Rejected

Reminder

Acceptance

Emails optional.

---

## Task 35

Testing

Authentication

Marketplace

Requests

Dashboard

Mobile

---

## Task 36

Deployment

Deploy

Vercel

Acceptance

Production working.

---

# Final QA Checklist

Authentication

☐ Login

☐ Logout

☐ Protected Routes

---

Marketplace

☐ Search

☐ Filter

☐ Responsive

---

Listings

☐ Create

☐ Edit

☐ Delete

☐ Sold

---

Requests

☐ Create

☐ Accept

☐ Reject

☐ Reveal Phone

---

Dashboard

☐ Requests

☐ Listings

☐ Profile

---

Deployment

☐ Environment Variables

☐ Database

☐ Storage

☐ Images

☐ Production URL

---

# Launch Checklist

☐ Seed demo listings

☐ Test with two Google accounts

☐ Mobile testing

☐ Fix bugs

☐ Deploy

☐ Share with GEC students

🚀 Ship!