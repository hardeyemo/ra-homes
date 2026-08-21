# RA Homes & Properties

Full-stack real estate site for RA Homes & Properties (Ilorin, Kwara State, Nigeria),
built with Next.js App Router, Prisma + MongoDB, Tailwind, Framer Motion, GSAP, and Resend.

## Stack

- **Next.js 14 (App Router)** + TypeScript
- **Prisma + MongoDB** — `Property`, `Agent`, `Inquiry`, `ViewingRequest`, `PropertySubmission`, `Contact`
- **NextAuth (Auth.js) v4** — Credentials provider against the `Agent` model, JWT sessions, role-based access (`AGENT` / `ADMIN`)
- **Tailwind CSS** — luxury charcoal/champagne/cream design tokens, driven by CSS variables for light + dark mode
- **next-themes** — light/dark mode toggle (Navbar, desktop + mobile)
- **Framer Motion** — hero entrance, floating WhatsApp button
- **GSAP** — subtle hero parallax and a ScrollTrigger stagger reveal on the homepage process section
- **Resend** — agent notifications and customer confirmations for every form on the site
- **Papaparse** — CSV property import
- **shadcn/ui**-style primitives in `components/ui`

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, RESEND_API_KEY, NEXTAUTH_SECRET
npx prisma generate
npx prisma db push     # syncs the schema to your MongoDB database
npx prisma db seed     # creates an admin account + 18 Ilorin properties
npm run dev
```

## Customer journey (by design)

Find Property → View Details → WhatsApp/Call → Schedule Viewing → RA handles the transaction.

There is intentionally **no "Buy Now" / payment flow** — every property page and card leads to
WhatsApp, a phone call, or a viewing request instead.

## What's implemented

- **Public marketplace** (`/properties`): buy/rent, property type, location/neighborhood, price,
  bedrooms, bathrooms filters; featured & status badges (sold/rented/pending); galleries; detail pages
- **Contact actions on every listing**: WhatsApp (pre-filled with the property name + location),
  Call, and Schedule a Viewing — plus a site-wide floating WhatsApp button
- **List Your Property** (`/sell`): name, phone, email, location, type, sale/rent, asking price,
  description, photo upload via Cloudinary, preferred contact method
- **Property Management** (`/property-management`): tenant coordination, rent collection,
  inspections, maintenance coordination, vacancy management, general oversight
- **SEO location pages** (`/locations/ilorin`, `/gra`, `/tanke`, `/gra-extension`): statically
  generated, pull live listings by city/neighborhood
- **Contact/inquiry system**: general contact form, property inquiries, and viewing requests all
  write to MongoDB and appear in the dashboard; Resend sends an RA notification *and* a customer
  confirmation for each
- **Admin/agent dashboard** (`/dashboard`): listings (with inline status + featured toggles,
  Cloudinary photo upload), inquiries, viewing requests, general contact messages, property
  submissions (approve/reject, or "Create Listing" to pre-fill a new listing from one), agent
  management (admin-only), CSV import (admin-only)
- **CSV import** (`/dashboard/import`, admin-only): downloadable template, client-side parsing,
  per-row validation preview, then bulk create via `/api/properties/import` (listings land as
  `DRAFT` for review before publishing)
- **Dark/light mode**: toggle in the Navbar (desktop + mobile), persisted via `next-themes`
- **Office info**: Shop 12, City Plaza, beside Kosemani Hospital, Emirs Road, Ilorin, Kwara State —
  in the Footer, Contact page, and About page

## Auth & access control

- One `User` model for everyone, with a `role` field (`USER` / `AGENT` / `ADMIN`) — a single
  `/login` page handles sign-in and sign-up for the whole site; sessions are JWT-based via
  NextAuth (`lib/auth.ts`)
- `middleware.ts` protects everything under `/dashboard/*`, allowing only `AGENT`/`ADMIN` roles
- Mutating API routes also check `getServerSession` directly (middleware doesn't cover `/api/*`)
- A plain `USER` can request agent access from `/profile`; an `ADMIN` approves or rejects the
  request from `/dashboard/agents`, which flips that same account's role to `AGENT` — no separate
  agent signup exists
- Agents see and manage only their own listings/inquiries/viewings; `ADMIN` users see everything
  and get access to Agents management and CSV import
- Seeded accounts (change before deploying anywhere real):
  - Admin: `admin@rahomesproperties.com` / `admin-demo-pass`
  - User with a pending agent request, for testing the approval flow: `sam.visitor@example.com` / `user-demo-pass`

Google/Facebook sign-in is available to any account (not agent-specific) and is optional — the
buttons on `/login` show as disabled until configured, nothing else breaks.
### Google / Facebook sign-in (property owners only)

Both are optional — the buttons on `/sell` show as disabled until configured, nothing else breaks.

**Google:**
1. [Google Cloud Console](https://console.cloud.google.com) → create a project → **APIs & Services → Credentials**
2. **Create Credentials → OAuth client ID** → Application type: **Web application**
3. Authorized redirect URI: `<your-domain>/api/auth/callback/google` (e.g. `http://localhost:3000/api/auth/callback/google` for local dev)
4. Copy the Client ID and Client Secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`

**Facebook:**
1. [Facebook Developers](https://developers.facebook.com) → create an app → add the **Facebook Login** product
2. Valid OAuth Redirect URI: `<your-domain>/api/auth/callback/facebook`
3. Copy the App ID and App Secret into `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` in `.env`

Restart the dev server (or redeploy) after adding either — like the Cloudinary keys, these are only
read at startup.

## Image uploads (Cloudinary)

Both the dashboard's listing form and the public "List Your Property" form upload straight from
the browser to Cloudinary — no file passes through our server, and only the resulting URL is
stored in MongoDB.

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Note your **Cloud Name** from the dashboard
3. Go to **Settings → Upload** → scroll to **Upload presets** → **Add upload preset**
   - Set **Signing Mode** to **Unsigned**
   - Optionally restrict allowed formats/max file size here
   - Save, and note the preset name
4. Add both to `.env`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset-name"
   ```
5. Restart `npm run dev`

Until these are set, the upload widgets show a message explaining they're not configured yet
instead of failing silently.

## Known limitations / next steps

- **Property submissions still need a manual step to become a listing.** Approving a submission
  in `/dashboard/submissions` doesn't auto-publish it — click **"Create Listing"** on the
  submission to open a pre-filled New Listing form (still lands as `DRAFT` for review).
- **CSV import** accepts `.csv` only (via Papaparse). True `.xlsx` support would need a library
  like `xlsx`/SheetJS added to parse binary Excel files — the API route and preview/validation UI
  are format-agnostic and would accept it with a small parsing-layer swap.
- **Map/geocoding**: `lat`/`lng` fields exist on `Property` but nothing geocodes an address yet.
- Dark mode is implemented via CSS variables driving the whole design-token palette (not per-component
  overrides), so it's consistent site-wide, but double-check any new component you add uses the
  semantic tokens (`bg-surface`, `text-ink`, `bg-parchment`, `border-line`) rather than hardcoded colors.
