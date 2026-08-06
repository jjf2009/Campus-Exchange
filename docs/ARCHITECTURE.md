# GEC Exchange
# Architecture Guide
Version 1.0

---

# Purpose

This document defines the engineering standards, architecture decisions, coding conventions, and best practices for the entire codebase.

Every AI coding agent (Claude Code, Cursor, Windsurf, Codex, Gemini CLI, etc.) must follow these rules.

When there is a conflict between this document and the PRD, the PRD defines product behavior while this document defines implementation.

---

# Philosophy

The project should be:

- Simple
- Modular
- Scalable
- Readable
- Type Safe

Never optimize for writing less code.

Always optimize for maintainability.

---

# Tech Stack

Frontend

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Next.js Server Actions
- Route Handlers
- PostgreSQL
- Supabase

Authentication

- Supabase Google OAuth

Validation

- Zod

Forms

- React Hook Form

Storage

- Supabase Storage

Deployment

- Vercel

---

# Project Structure

app/

(auth)

dashboard/

marketplace/

listing/

new-listing/

profile/

components/

actions/

lib/

hooks/

types/

utils/

db/

emails/

public/

---

# Folder Responsibilities

app/

Contains routes only.

No business logic.

---

components/

Reusable UI Components.

No database access.

No server logic.

---

actions/

Contains Server Actions.

All database mutations happen here.

Examples

createListing()

deleteListing()

acceptRequest()

rejectRequest()

---

lib/

Contains helper libraries.

Examples

supabase.ts

auth.ts

storage.ts

---

db/

Contains

Database schema

Database queries

Database types

---

hooks/

React hooks only.

No API calls.

---

types/

Global TypeScript interfaces.

Enums

Shared Types

---

utils/

Pure utility functions.

Examples

formatPrice()

formatDate()

compressImage()

---

emails/

React Email templates.

---

# Naming Convention

Components

PascalCase

ListingCard.tsx

Navbar.tsx

SearchBar.tsx

---

Hooks

camelCase

useUser.ts

useSearch.ts

---

Utilities

camelCase

formatPrice.ts

uploadImage.ts

---

Database Tables

snake_case

purchase_requests

listing_images

---

Variables

camelCase

listingPrice

userProfile

---

Constants

UPPER_CASE

MAX_IMAGE_SIZE

DEFAULT_PAGE_SIZE

---

# TypeScript Rules

Enable strict mode.

Never use

any

Always create interfaces.

Example

interface Listing {

id:string

title:string

price:number

}

Never disable TypeScript errors.

---

# Component Rules

Components should be

Small

Reusable

Independent

Maximum

200 lines

If larger

Split it.

---

# Server Components

Default

Everything should be

Server Component

Only use

"use client"

when required.

Examples

Forms

Dropdown

Modal

Image Upload

Search Input

Everything else

Server Component

---

# Client Components

Only when

State

Event Handling

Animation

Browser APIs

are needed.

---

# Data Fetching

Always fetch on the server.

Never fetch inside

useEffect()

unless absolutely necessary.

---

# Server Actions

All mutations happen using

Server Actions.

Never expose unnecessary APIs.

Examples

createListing()

updateProfile()

acceptRequest()

markSold()

---

# Validation

Every mutation must validate data using

Zod

Never trust client validation.

Always validate again on server.

---

# Authentication

Every protected page

Must verify

Current User

Never trust client session.

---

# Authorization

Every mutation verifies ownership.

Example

Delete Listing

Check

listing.sellerId

==

currentUser.id

If not

Throw

Unauthorized

---

# Database Rules

No duplicate data.

Normalize where possible.

Use foreign keys.

Use indexes.

Never store

derived values.

---

# Error Handling

Never expose

database errors

to users.

Instead

Return

Readable Messages

Example

Wrong

Error 23505

Correct

This listing already exists.

---

# Logging

Console logs

Development only.

Production

Use

Error Logging

if required.

Remove debug logs before deployment.

---

# Loading States

Every async operation

Needs loading state.

Examples

Uploading Image

Creating Listing

Requesting Item

Saving Profile

---

# Empty States

Never show blank pages.

Marketplace

"No listings found."

Dashboard

"You haven't listed anything yet."

Requests

"No incoming requests."

---

# Images

Compress before upload.

Maximum

5 MB

Allowed

JPEG

PNG

WEBP

Store only URL.

Never store binary.

---

# Security

Phone number

Never visible

Until request accepted.

Never expose

seller phone

inside listing query.

---

# Search

Search

Title

Description

Category

Ignore

Phone

Email

---

# Performance

Use

Server Components

Pagination

Lazy Images

Dynamic Imports

Image Optimization

---

# Accessibility

Buttons

Need labels.

Forms

Need labels.

Images

Need alt text.

Keyboard navigation

Supported.

---

# Mobile First

Design

Starts

Mobile

Then Tablet

Then Desktop

---

# Styling

Tailwind only.

No CSS files unless necessary.

Use

shadcn/ui

before writing custom components.

---

# State Management

Use

React State

first.

Only introduce Zustand later if genuinely needed.

---

# Forms

Every form

Uses

React Hook Form

+

Zod

---

# Toasts

Every successful mutation

Shows toast.

Examples

Listing Created

Listing Updated

Item Sold

---

# Database Transactions

Operations involving multiple updates must run atomically.

Example

Accept Request

↓

Accept buyer

↓

Reject remaining buyers

↓

Update listing status

↓

Commit

---

# Route Protection

Public

Landing

Login

Protected

Marketplace

Dashboard

Create Listing

Edit Listing

Profile

---

# Environment Variables

Never hardcode secrets.

Use

.env.local

Examples

SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE

RESEND_API_KEY

NEXT_PUBLIC_APP_URL

---

# Git Strategy

main

Production

feature/*

New features

bugfix/*

Bug fixes

---

# Commit Messages

Examples

feat: add marketplace page

fix: resolve image upload issue

refactor: simplify request flow

style: improve mobile spacing

---

# Code Review Checklist

Before merging

✓ Types correct

✓ No any

✓ Mobile responsive

✓ Loading state

✓ Error handling

✓ Authorization

✓ Validation

✓ Accessible

✓ Reusable

---

# AI Development Rules

When generating code

Always

1.

Read existing files first.

Never overwrite working code.

---

2.

Reuse components.

Do not duplicate UI.

---

3.

Follow folder structure.

---

4.

Keep components under 200 lines.

---

5.

Keep business logic inside Server Actions.

---

6.

Never place SQL inside components.

---

7.

Never place database logic inside UI.

---

8.

Write clean TypeScript.

---

9.

Explain architectural decisions in comments only when necessary.

---

10.

Prefer readability over cleverness.

---

# Definition of Quality

Good code is

Easy to read

Easy to debug

Easy to extend

Easy to delete

If adding a feature requires changing many unrelated files, the architecture should be reconsidered.

---

# Final Principle

This application is intentionally small.

Every new feature should answer one question:

**Does this make it easier for a GEC student to buy or sell used items?**

If the answer is **no**, postpone it until a future version.