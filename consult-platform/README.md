# Consult Platform

A white-label website and client portal for consultancies: consulting services,
online training, consultation booking and an investor page, built to be
re-branded per client.

Stack: Next.js (App Router), Supabase (Postgres, auth), Tailwind CSS.

## Run it

```bash
npm install
```

```bash
npm run dev
```

With no environment variables the site runs in **preview mode**: it shows the
sample content in `src/content/seed.ts`, and sign-in and forms are switched off.

## Connect a database

1. Create a Supabase project.
2. Run `supabase/migrations/*.sql`, then `supabase/seed.sql`, in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the Supabase values.

## Re-brand it for a client

1. Copy `src/config/presets/meridian.ts`, change the name, colours, contact
   details and copy, and register it in `src/config/brand.ts`.
2. Set `NEXT_PUBLIC_BRAND=<key>` and deploy.

Sections can be switched on and off per brand with `features`.

## Checks

| Command | What it does |
| --- | --- |
| `npm run lint` | Lint |
| `npm run typecheck` | Type check |
| `npm run build` | Production build |
| `npm run test:db` | Applies the schema to a local Postgres and tests the access rules |
| `npm run seed:sql` | Regenerates `supabase/seed.sql` from `src/content/seed.ts` |

## Before going live

- Replace all sample content: services, team, case studies, testimonials,
  statistics and courses are fictional.
- Have an attorney review `/legal/privacy` and `/legal/terms`.
