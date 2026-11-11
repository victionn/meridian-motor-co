# meridian-motor-co

Website rebuild for Meridian Motor Co — a prestige / classic car dealer in Sydney.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · Postgres + Drizzle · Zod · HubSpot (leads)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

Runs out of the box: inventory comes from `src/data/vehicles.json` and form submissions are logged to the console.

## Scripts

| Script | What it does |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `db:generate` / `db:migrate` / `db:studio` | Drizzle migrations against `DATABASE_URL` |

## Structure

```
src/
  app/
    page.tsx                  Home
    cars/page.tsx             Inventory — filters, sort, pagination (all URL-driven)
    cars/[slug]/page.tsx      Vehicle detail — gallery/360, specs, enquiry, finance, JSON-LD
    sell/ finance/ service/ about/ contact/ privacy/
    api/cron/sync-inventory/  DMS → Postgres sync (cron, bearer-protected)
    vehicle/[slug]/route.ts   308 redirects from old-site vehicle URLs (SEO)
    sitemap.ts robots.ts not-found.tsx error.tsx
  components/                 UI (server by default; client: lead-form, finance-calculator, vehicle-gallery, mobile-nav)
  content/site.ts             Business details, nav, finance defaults — single source of truth
  data/vehicles.json          Seed inventory for local dev
  db/                         Drizzle schema + client
  lib/
    inventory/                Repository interface + JSON and Postgres implementations, cached accessors
    dms/                      DMS adapter interface, example JSON-feed adapter, sync job
    leads/                    Zod schema, server action, CRM client (log | HubSpot)
    finance.ts format.ts types.ts
```

## Key decisions

- **Repository pattern for inventory.** Pages call `src/lib/inventory/index.ts` only. Switch `INVENTORY_SOURCE=json|postgres` without touching UI; add Typesense/Algolia later behind the same interface if search outgrows SQL.
- **Caching.** All inventory reads use `"use cache"` + `cacheTag("inventory")`. The sync job calls `revalidateTag("inventory", "max")`, so pages are static-fast but update within one sync of a stock change.
- **URL-driven filters.** The inventory filter is a plain GET form: works without JS, every filtered view is shareable and crawlable.
- **DMS is pluggable.** Implement `DmsAdapter` for the dealer's actual provider. Feed rows are Zod-validated; a `$0` price becomes "Price on application" instead of being published. Cars missing from the feed are marked `sold` (not deleted), and an empty feed aborts the sync.
- **Leads via server action** (`submitLead`) with Zod validation and a honeypot. `CRM_PROVIDER=hubspot` posts to the HubSpot Forms API.
- **360° viewer slot.** `Vehicle.spin360Url` renders as a "360° view" tab in the gallery and a badge on cards. Provider-agnostic iframe — swap for an SDK component if needed.
- **SEO.** Per-vehicle metadata and `Car` JSON-LD, `AutoDealer` JSON-LD site-wide, dynamic sitemap, legacy URL redirects in `next.config.ts` + `app/vehicle/[slug]/route.ts`.
- **Fonts self-hosted** via `@fontsource-variable` (no build-time network dependency).

## Going to production

1. Confirm the DMS provider and implement its adapter in `src/lib/dms/`.
2. Provision Postgres (Neon / Supabase), set `DATABASE_URL`, `INVENTORY_SOURCE=postgres`, run `npm run db:generate && npm run db:migrate`.
3. Set `CRON_SECRET`, `DMS_FEED_URL`, `DMS_API_KEY`. `vercel.json` runs the sync every 30 min.
4. Create the HubSpot form (fields: `firstname`, `lastname`, `email`, `phone`, `message`, `lead_type`, `vehicle_stock_id`, `vehicle_title`, `preferred_date`, `rego`, `trade_in`) and set `CRM_PROVIDER=hubspot` + IDs.
5. Add the image CDN host to `images.remotePatterns` in `next.config.ts`.
6. Replace placeholder copy: privacy policy (needs an effective date), about story, care-plan pricing, finance rate in `src/content/site.ts`.
7. Set `NEXT_PUBLIC_SITE_URL`, submit `/sitemap.xml` in Search Console.

## Not included (next steps)

- Headless CMS for marketing pages (content currently in `src/content/site.ts` and page files).
- Saved searches / favourites, compare, analytics, cookie consent.
- Admin for the `featured` flag (set in the DB for now — the sync never overwrites it).
