# Consult Platform

A white-label website and client portal for consultancies, built to be
re-branded and deployed once per client.

- **Public site**: services, case studies, team, investors page, contact and
  consultation booking.
- **Training**: online courses with storyboard-style lessons (text, video,
  click-to-reveal, flashcards, knowledge checks, embedded Storyline/Rise
  packages), progress tracking and verifiable certificates.
- **Live sessions**: advertised on the site, free or paid, with the Zoom link
  shown only to people who registered.
- **Payments**: PayFast checkout for courses, live session seats and
  consultation deposits, with discount codes.
- **Admin area**: leads, consultations, courses and lessons, website content,
  live sessions, payments, discount codes and users. Two staff roles: admin
  (everything) and editor (courses, live sessions and website content only).

Stack: Next.js (App Router), Supabase (Postgres and auth), Tailwind CSS.

## Status

| Area | State |
| --- | --- |
| Public site, lesson player, forms | Built and browser-tested in preview mode |
| Database schema and access rules | Tested on local Postgres (`npm run test:db`) |
| Payment signing, form handling, lesson content | Unit-tested (`npm test`) |
| Sign-in, dashboard, checkout, admin area | Built, **not yet run against a live Supabase project** |
| PayFast | Built, **not yet run against PayFast** (needs a merchant or sandbox account and a public URL) |

Until the services below are connected the site says so itself: a banner in
preview mode, and "online payment is still under construction" at checkout.

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

With no environment variables the site runs in **preview mode**: it shows the
sample content from `src/content/seed.ts`, lessons are open, and sign-in,
forms and payments are switched off.

## Going live: what each client site needs

1. **Supabase project** (database and sign-in)
   - Run `supabase/migrations/*.sql`, then `supabase/seed.sql`, in the SQL editor.
   - Authentication → URL configuration: set the site URL and add
     `https://YOUR-DOMAIN/auth/confirm` as a redirect URL.
   - Copy the project URL, publishable key and secret key into the environment.
2. **First admin**: register on the site, then run once in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   After that, admins promote others under Admin → Users.
3. **Domain and hosting**: deploy to Vercel (or any Node host) and set
   `NEXT_PUBLIC_SITE_URL` to the live address.
4. **PayFast**: set the merchant ID, key and passphrase. Test with
   `PAYFAST_SANDBOX=true` first; set it to `false` to take real money.
   PayFast must be able to reach `https://YOUR-DOMAIN/api/payfast/itn`.
5. **Email (Resend)**: set `RESEND_API_KEY` and `EMAIL_FROM` so that new leads
   and booking confirmations are emailed. Without them nothing is sent, but
   everything still appears in the admin area.

All variables are listed in `.env.example`.

## Re-brand it for a client

1. Copy `src/config/presets/meridian.ts`; change the name, colours, contact
   details, copy and feature switches; register it in `src/config/brand.ts`.
2. Set `NEXT_PUBLIC_BRAND=<key>` and deploy.

Three demo brands are included: `meridian`, `umoja` and `apex`.

## Before launch

- Replace all sample content. Services, team, case studies, testimonials,
  statistics, courses and live sessions are fictional.
- Have an attorney review `/legal/privacy` and `/legal/terms`.
- Run through sign-up, enrolment, a sandbox payment and the admin area on the
  live Supabase project.

## Checks

| Command | What it does |
| --- | --- |
| `npm run lint` | Lint |
| `npm run typecheck` | Type check |
| `npm test` | Unit tests |
| `npm run test:db` | Applies the schema to a local Postgres and tests the access rules |
| `npm run build` | Production build |
| `npm run seed:sql` | Regenerates `supabase/seed.sql` from `src/content/seed.ts` |

## Where things live

| Path | Contents |
| --- | --- |
| `src/config` | Brand presets and feature switches |
| `src/content/seed.ts` | Sample content |
| `src/app/(site)` | Public pages, dashboard, checkout |
| `src/app/learn` | Lesson player |
| `src/app/admin` | Admin area |
| `src/lib/actions` | Server actions (forms, enrolment, checkout, admin) |
| `src/lib/admin/resources.ts` | Describes each kind of content the admin area manages |
| `src/lib/blocks.ts` | Lesson content model |
| `src/lib/payfast.ts` | PayFast signing and notification checks |
| `supabase` | Schema, seed data and access-rule tests |
