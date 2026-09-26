# Campus Exchange
### Product Requirements Document (PRD)
**Version:** 1.0 (MVP)
**Target Launch:** Monday
**Author:** Jared
**Status:** In Development

---

# 1. Product Vision

## Overview

Campus Exchange is a marketplace exclusively for students of Goa College of Engineering (GEC) to buy and sell used academic equipment, electronics, books, hostel items, and other student essentials.

Every year senior students finish using expensive equipment like:

- Boilers
- Bombers
- Drafters
- Mini Drafters
- Engineering Drawing Sets
- Scientific Calculators
- Laptops
- Textbooks

Meanwhile juniors spend thousands buying the exact same equipment brand new.

The goal of GEC Exchange is to connect students and encourage reuse while saving money.

The platform does NOT handle payments.

It simply helps students discover items, request them, and connect through WhatsApp after the owner accepts.

---

# 2. Goals

## Primary Goals

- Build a trusted marketplace for GEC students.
- Reduce waste by encouraging reuse.
- Help juniors save money.
- Make buying/selling equipment extremely easy.
- Launch within one week.

---

## Success Metrics

Launch Week

- 50+ Users
- 25 Listings
- 10 Successful Transactions

Month One

- 150 Users
- 100 Listings
- 40 Successful Sales

---

# 3. MVP Scope

The MVP includes only the essential features.

## Included

✅ Google Authentication

✅ User Profiles

✅ Marketplace

✅ Search

✅ Category Filters

✅ Create Listing

✅ Edit Listing

✅ Delete Listing

✅ Request to Buy

✅ Seller Dashboard

✅ Accept / Reject Requests

✅ Reveal Seller WhatsApp after Acceptance

✅ Mark Item Sold

---

## NOT Included

❌ Payments

❌ Chat

❌ Ratings

❌ Reviews

❌ Delivery Tracking

❌ Wishlist

❌ Admin Dashboard

❌ Push Notifications

❌ AI Recommendations

❌ Price Negotiation

---

# 4. User Roles

There are only two roles.

## Student

Can

- Login
- Browse Listings
- Search
- Request Items
- View Own Requests
- Create Listings
- Edit Listings
- Delete Listings

Every user can become a buyer and seller.

There are no separate accounts.

---

# 5. User Flow

```
Student

↓

Google Login (@gec.ac.in only)

↓

Complete Profile

↓

Marketplace

↓

Open Listing

↓

Chat on WhatsApp (one tap, pre-filled message)

↓

Seller notified: "Rahul is interested in Boiler"

↓

Students meet and pay offline

↓

Seller marks Reserved → Sold
```

> **Why no request/accept step?** v1 had no way to know when an item sold.
> v2 added "request → seller accepts → number revealed", which fixed that but
> made buyers wait on sellers who rarely came back to click Accept. The
> contact flow removes the wait and instead keeps listings fresh on the
> seller side (see §13).

---

# 6. Complete User Journey

## First Login

Student clicks

Continue with Google

↓

Google Authentication

↓

Check if profile exists

If No

↓

Profile Completion Page

Student enters

- Branch
- Year
- WhatsApp Number

↓

Profile Saved

↓

Marketplace

---

## Returning User

Google Login

↓

Marketplace

---

# 7. Marketplace

The Marketplace is the home page after login.

It contains

- Search Bar
- Categories
- Listings Grid
- Sorting
- Empty State

---

# 8. Search

Students can search by

- Item Name

Examples

Boiler

Laptop

Bomber

Calculator

Books

Search is instant.

---

# 9. Categories

Categories are fixed.

```
Academic

• Boiler
• Bomber
• Drafter
• Mini Drafter
• Drawing Kit
• Books

Electronics

• Laptop
• Calculator
• Monitor
• Keyboard
• Mouse

Hostel

• Chair
• Mattress
• Bucket
• Table

Others
```

No custom categories.

---

# 10. Listing Card

Each listing displays

```
Image

Title

₹ Price

Category

Condition

Seller Name

Posted Date

Request Button
```

Example

```
----------------------------

📷

Boiler

₹850

Condition
Good

Mechanical

Posted Yesterday

[Request Item]

----------------------------
```

---

# 11. Product Detail Page

Clicking a listing opens

Large Image

Title

Price

Description

Condition

Category

Seller

Branch

Year

Posted On

Request Button

---

# 12. Listing Status

Each listing has one status.

AVAILABLE

Visible. Buyers can chat.

RESERVED

Visible with a "Reserved" badge. Seller is finalising with someone.
Reversible if the deal falls through.

SOLD

Hidden from marketplace. Optionally records which buyer bought it.

EXPIRED

Hidden because the seller hasn't confirmed it's still available, or buyers
reported it sold. The seller can renew it in one tap.

ARCHIVED

Owner removed listing.

---

# 13. Contact Flow & Listing Freshness

Buyer clicks **Chat on WhatsApp**

↓

Contact recorded (one per buyer per listing, max 15 new sellers per day)

↓

WhatsApp opens with

```
Hi! I saw your Boiler (₹850) on GEC Exchange. Is it still available? <link>
```

↓

Seller gets an in-app notification

**How we know an item is gone**

- 48h after a buyer contacts the seller, the seller is asked "Still available?"
  (Sold / Reserved / Still available).
- Every listing shows "Confirmed available X days ago". At 14 days the seller
  is asked, and at 21 days the listing is hidden.
- Buyers who contacted the seller can tap "Report as sold". 2 reports hide it.
- When marked sold, everyone else who asked is notified.

---

# 14. Seller Dashboard

Contains

Dashboard Overview

↓

My Listings

↓

Interested Buyers

↓

"Are these still available?" prompts

↓

Profile

---

# 15. My Listings

Each card

Image

Title

Price

Status

Edit

Delete

Mark Sold

Example

```
Boiler

₹850

Status

Available

Edit

Delete

```

---

# 16. Interested Buyers

Seller sees, per listing

```
Boiler · 3 interested

Rahul · Mechanical · Second Year · 2 hours ago   [WhatsApp]

Reserve   Mark Sold   Edit   Delete
```

---

# 17. Reserve Flow

Seller clicks Reserve → listing shows "Reserved", buyers can still message
in case the deal falls through. Unreserve returns it to Available.

---

# 18. Renew Flow

Hidden (EXPIRED) listings appear at the top of the dashboard under
"Are these still available?". Renew makes it Available and resets the clock.

---

# 19. Sold Flow

Seller clicks Mark Sold

↓

Optional: "Who bought it?" (from buyers who contacted)

↓

Listing removed from marketplace

↓

Other interested buyers are notified it's sold.

---

# 20. User Profile

Every profile stores

Name

Email

Google Image

Branch

Year

WhatsApp Number

Joined Date

---

# 21. Data Model

## User

```
id

name

email

image

branch

year

phone

createdAt

updatedAt
```

---

## Listing

```
id

sellerId

title

description

price

category

condition

imageUrl

status

createdAt

updatedAt
```

---

## PurchaseRequest

```
id

listingId

buyerId

status

createdAt

updatedAt
```

---

# 22. Database Relationships

```
User

1

↓

Many Listings

Listing

1

↓

Many Purchase Requests

Purchase Request

↓

One Buyer
```

---

# 23. Pages

```
/

Landing

/login

/profile/setup

/marketplace

/listing/[id]

/dashboard

/dashboard/listings

/dashboard/requests

/dashboard/profile

/new-listing

/edit-listing/[id]
```

---

# 24. Navigation

Navbar

Logo

Marketplace

New Listing

Dashboard

Profile

Logout

---

# 25. Components

Global Components

Navbar

Footer

Search Bar

Category Filter

Listing Card

Image Carousel

Price Badge

Status Badge

Request Button

Modal

Loading Skeleton

Toast Notifications

Empty State

Pagination

---

# 26. UI Theme

Design Goals

- Clean
- Fast
- Minimal
- Mobile First

Color Palette

Primary

Blue

Accent

Green

Background

White

Cards

Light Gray

Rounded corners

Medium

Buttons

Large

Friendly

---

# 27. Mobile Responsiveness

Must work perfectly on phones because most students will access it from WhatsApp links.

Breakpoints

Mobile

Tablet

Desktop

Cards become

1 Column

2 Columns

4 Columns

---

# 28. File Structure

```
app/

(auth)

dashboard/

marketplace/

listing/

profile/

components/

lib/

actions/

hooks/

types/

utils/

db/

emails/

public/

```

---

# 29. Architecture

```
Next.js

↓

Server Actions

↓

Supabase

↓

PostgreSQL

↓

Storage

↓

Marketplace
```

Authentication

Google OAuth

Database

PostgreSQL

Storage

Supabase Storage (or Cloudinary)

Deployment

Vercel

---

# 30. Development Philosophy

This is **not** an e-commerce platform.

This is **not** Amazon.

This is **not** OLX.

It is a lightweight college marketplace focused on one simple workflow:

```
Student lists an item

↓

Another student requests it

↓

Owner accepts

↓

Buyer gets WhatsApp number

↓

Students coordinate offline

↓

Owner marks item as sold
```

Every feature added to the MVP should support this workflow. If a feature doesn't directly improve listing, requesting, accepting, or completing a sale, it should be postponed until a future version.
# GEC Exchange
# Product Requirements Document (PRD)
## Part 2 — Technical Specification

---

# 31. Tech Stack

## Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Lucide Icons

---

## Backend

- Next.js Server Actions
- Next.js Route Handlers
- Supabase
- PostgreSQL

---

## Authentication

Supabase Google OAuth

---

## Image Storage

Supabase Storage

Bucket

```
listing-images
```

---

## Deployment

- Vercel
- Supabase

---

## Email

Resend

Only used for

- Optional reminder email
- Accepted request
- Rejected request

The application should function even if email delivery fails.

---

# 32. Folder Structure

```
app/

(auth)/
    login/

marketplace/

listing/
    [id]/

dashboard/
    listings/
    requests/
    profile/

new-listing/

edit-listing/
    [id]/

actions/

api/

components/

db/

hooks/

lib/

utils/

emails/

types/

middleware.ts

```

---

# 33. Database Schema

---

## users

```
id UUID PRIMARY KEY

email

name

avatar_url

branch

year

phone

created_at

updated_at
```

---

## listings

```
id UUID PRIMARY KEY

seller_id

title

description

price

category

condition

image_url

status

AVAILABLE

PENDING_APPROVAL

SOLD

ARCHIVED

created_at

updated_at
```

---

## purchase_requests

```
id UUID PRIMARY KEY

listing_id

buyer_id

status

PENDING

ACCEPTED

REJECTED

created_at

updated_at
```

---

# 34. Database Relationships

```
User

1

↓

Many Listings

Listing

1

↓

Many Purchase Requests

Purchase Request

↓

One Buyer
```

---

# 35. API / Server Actions

## Authentication

```
signIn()

signOut()

completeProfile()
```

---

## Listings

```
createListing()

updateListing()

deleteListing()

getListings()

getListingById()

markSold()

archiveListing()
```

---

## Purchase Requests

```
createRequest()

acceptRequest()

rejectRequest()

getIncomingRequests()

getMyRequests()
```

---

## Profile

```
updateProfile()

getProfile()
```

---

# 36. Business Logic

## Create Listing

Validation

- Title required
- Description required
- Price > 0
- Image required
- Category required
- Phone exists
- User profile completed

---

Flow

```
Upload Image

↓

Save Listing

↓

Status

AVAILABLE

↓

Marketplace Updated
```

---

# 37. Request Logic

Buyer presses

```
Request Item
```

System checks

```
Listing Exists

Owner != Buyer

Listing AVAILABLE

No previous request
```

If all pass

```
Create Purchase Request

Status

PENDING
```

---

# 38. Accept Request

Seller clicks

Accept

System

```
Verify seller owns listing

↓

Request

Accepted

↓

Listing

PENDING_APPROVAL

↓

Reject remaining requests automatically

↓

Send optional email

↓

Buyer can now view phone number
```

---

# 39. Reject Request

Seller

Reject

↓

Request

Rejected

↓

Buyer notified

↓

Listing remains

AVAILABLE
```

---

# 40. Mark Sold

Seller

↓

Mark Sold

↓

Listing Status

SOLD

↓

Hidden from Marketplace

↓

Visible only in Dashboard
```

---

# 41. Validation Rules

Title

```
5–80 characters
```

Description

```
20–500 characters
```

Price

```
Greater than zero
```

Phone

```
10+ digits
```

Images

```
Maximum 5 MB

JPEG

PNG

WEBP
```

---

# 42. Security Rules

Students cannot

- Edit other listings
- Delete other listings
- Accept requests on others' listings
- View another seller's phone number
- Mark another listing sold

All server actions must verify ownership.

Never trust client-side checks.

---

# 43. Row Level Security (Supabase)

Users can

Read

```
All AVAILABLE listings
```

Insert

```
Only their own listings
```

Update

```
Only listings they own
```

Delete

```
Only listings they own
```

Purchase Requests

Buyer

Can create only one request.

Seller

Can view only requests for listings they own.

---

# 44. Phone Number Visibility

Very important.

Phone numbers should NEVER appear in

Marketplace

Search Results

Listing Card

Listing Page

Phone becomes visible ONLY after

```
Purchase Request

↓

Accepted
```

---

# 45. Error Handling

Common errors

```
Listing not found

Already requested

Cannot buy your own item

Listing already sold

Unauthorized

Image upload failed

Database unavailable

Email failed
```

Email failures must never block the purchase flow.

---

# 46. Empty States

Marketplace

```
No listings found.
```

Dashboard

```
You haven't listed anything yet.
```

Requests

```
No incoming requests.
```

Search

```
No matching items found.
```

---

# 47. Loading States

Skeleton Cards

Image Placeholder

Button Spinner

Page Loading

Uploading Image...

Creating Listing...

Sending Request...

---

# 48. Notifications

Success

```
Listing created.

Request sent.

Listing updated.

Marked as sold.
```

Error

```
Something went wrong.

Please try again.
```

---

# 49. Email Templates

## New Request

Subject

```
New request for your listing
```

Body

```
Hi Jared,

Someone requested your Boiler.

Open GEC Exchange to accept or reject.

```

---

## Accepted

```
Your request has been accepted.

Seller

Rahul

Phone

98XXXXXXXX

Open WhatsApp
```

---

## Rejected

```
Seller rejected your request.

The item is still available for others.
```

---

# 50. Image Upload Flow

```
Choose Image

↓

Compress (optional)

↓

Upload to Storage

↓

Receive URL

↓

Store URL

↓

Display Preview
```

---

# 51. Search Logic

Search Fields

Title

Description

Category

Sorting

Newest

Oldest

Price Low

Price High

---

# 52. Dashboard Sections

```
Overview

↓

My Listings

↓

Incoming Requests

↓

Sold Items

↓

Profile
```

Overview Cards

```
Listings

Sold

Pending Requests

Accepted
```

---

# 53. Future Roadmap

Version 1.1

- Wishlist
- Better Filters
- Pagination

Version 1.2

- Notifications
- Recent Listings

Version 2

- Chat
- Reviews
- Ratings
- Admin Dashboard
- Analytics
- Report Listing
- Saved Searches

---

# 54. Testing Checklist

Authentication

- Google Login
- Logout
- New user profile

Listings

- Create
- Edit
- Delete
- Sold

Requests

- Send
- Accept
- Reject
- Multiple requests

Dashboard

- Listings visible
- Requests visible

Search

- Works correctly

Phone Number

- Hidden before acceptance
- Visible after acceptance

Mobile

- Responsive

Deployment

- Works on Vercel

---

# 55. Deployment Checklist

- Environment variables configured
- Google OAuth configured
- Supabase connected
- Storage bucket created
- Database migrated
- RLS enabled
- Vercel deployed
- Domain connected (optional)
- Test with multiple accounts
- Seed sample listings

---

# 56. AI Coding Plan

Build in this exact order.

### Phase 1

- Project setup
- Tailwind
- shadcn/ui
- Supabase
- Authentication

---

### Phase 2

- Database
- Marketplace
- Listing Cards

---

### Phase 3

- Create Listing
- Upload Images
- Dashboard

---

### Phase 4

- Product Detail
- Purchase Requests

---

### Phase 5

- Accept / Reject Flow
- Phone Reveal
- Mark Sold

---

### Phase 6

- Search
- Filters
- Empty States

---

### Phase 7

- Polish
- Mobile UI
- Bug Fixes
- Deploy

---

# 57. Definition of Done

The MVP is complete when:

- Students can sign in with Google.
- Students can complete their profile.
- Students can browse listings.
- Students can create listings with images.
- Students can search and filter items.
- Students can request an item.
- Owners can accept or reject requests.
- Accepted buyers can view the seller's WhatsApp number.
- Owners can mark listings as sold.
- The app is deployed and usable on mobile devices.

---

# 58. Guiding Principles

Every decision should support one simple workflow:

```
List Item
        ↓
Discover Item
        ↓
Request Item
        ↓
Owner Accepts
        ↓
Reveal WhatsApp Number
        ↓
Students Coordinate Offline
        ↓
Owner Marks Sold
```

If a feature does **not** improve this flow, it should be postponed until a future release.

---

# 59. Final Notes

- Prioritize speed, reliability, and clarity over feature count.
- Build for the habits of college students: quick browsing, simple interactions, and WhatsApp for communication.
- Keep the UI minimal and responsive.
- Avoid unnecessary complexity until the marketplace has proven adoption.

**Ship first. Iterate based on real student feedback.**