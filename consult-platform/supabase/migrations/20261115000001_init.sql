-- Consultancy platform: core schema, access rules and helper functions.
-- Run on a fresh Supabase project (SQL editor or `supabase db push`).

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
-- member: a client or learner. editor: may manage courses, live sessions and
-- website content. admin: everything, including leads, payments and users.
create type public.user_role as enum ('member', 'editor', 'admin');
create type public.order_kind as enum ('course', 'live_session', 'consultation');
create type public.discount_kind as enum ('percent', 'amount');
create type public.course_format as enum ('self_paced', 'live', 'hybrid');
create type public.enrolment_status as enum ('active', 'completed', 'refunded');
create type public.order_status as enum ('pending', 'paid', 'failed', 'cancelled');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
create type public.booking_mode as enum ('online', 'in_person');
create type public.lead_status as enum ('new', 'in_progress', 'closed');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 160),
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Admin check used by every policy. SECURITY DEFINER so it can read profiles
-- without recursing into the profiles policies.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Admins and content editors.
create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'editor')
  );
$$;

-- Create a profile whenever someone signs up.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, company)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 120),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 40), ''),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'company', ''), 160), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Public content
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  description text not null default '',
  icon text not null default 'briefcase',
  deliverables text[] not null default '{}',
  price_from_cents integer check (price_from_cents is null or price_from_cents >= 0),
  duration_label text,
  -- Deposit taken online when a consultation for this service is booked. 0 = none.
  booking_deposit_cents integer not null default 0 check (booking_deposit_cents >= 0),
  featured boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  role_title text not null default '',
  bio text not null default '',
  photo_url text,
  credentials text[] not null default '{}',
  linkedin_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  client_name text not null default '',
  industry text not null default '',
  summary text not null default '',
  challenge text not null default '',
  approach text not null default '',
  outcome text not null default '',
  -- [{ "label": "Revenue growth", "value": "38%" }]
  metrics jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text not null,
  author_title text not null default '',
  company text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Training
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  description text not null default '',
  level text not null default 'All levels',
  duration_label text not null default '',
  format public.course_format not null default 'self_paced',
  price_cents integer not null default 0 check (price_cents >= 0),
  cover_url text,
  outcomes text[] not null default '{}',
  featured boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_modules_course_id_idx on public.course_modules (course_id);

-- Lesson outline is public (so the curriculum can be shown on the sales page);
-- the lesson body lives in lesson_contents and is restricted to enrolled users.
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid not null references public.course_modules (id) on delete cascade,
  title text not null,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  is_preview boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lessons_course_id_idx on public.lessons (course_id);
create index lessons_module_id_idx on public.lessons (module_id);

create table public.lesson_contents (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  -- Ordered list of content blocks (text, video, reveal, flashcards, quiz,
  -- embed ...). A "slide" block starts a new screen. See src/lib/blocks.ts.
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  updated_at timestamptz not null default now()
);

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{3,32}$'),
  description text not null default '',
  kind public.discount_kind not null default 'percent',
  -- percent: 1 to 100. amount: cents off.
  value integer not null check (value > 0),
  -- null = valid for everything
  applies_to public.order_kind,
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100)
);

-- One order pays for one thing: a course, a seat in a live session, or a
-- consultation deposit. Item columns for live sessions and bookings are added
-- further down, once those tables exist.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  kind public.order_kind not null,
  course_id uuid references public.courses (id) on delete restrict,
  description text not null default '',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  amount_cents integer not null check (amount_cents >= 0),
  discount_code_id uuid references public.discount_codes (id) on delete set null,
  currency text not null default 'ZAR',
  status public.order_status not null default 'pending',
  provider text not null default 'payfast',
  provider_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now(),
  check (amount_cents = subtotal_cents - discount_cents)
);
create index orders_user_id_idx on public.orders (user_id);
create index orders_course_id_idx on public.orders (course_id);
create index orders_discount_code_id_idx on public.orders (discount_code_id);

create table public.enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  order_id uuid references public.orders (id) on delete set null,
  status public.enrolment_status not null default 'active',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index enrolments_course_id_idx on public.enrolments (course_id);
create index enrolments_order_id_idx on public.enrolments (order_id);

create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);
create index lesson_progress_course_id_idx on public.lesson_progress (course_id);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  serial text not null unique default upper(encode(extensions.gen_random_bytes(6), 'hex')),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete restrict,
  recipient_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create index certificates_course_id_idx on public.certificates (course_id);

-- ---------------------------------------------------------------------------
-- Live training sessions (held on Zoom, Teams or similar)
-- ---------------------------------------------------------------------------
create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  description text not null default '',
  presenter text not null default '',
  starts_at timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  platform text not null default 'Zoom',
  -- 0 = free to register
  price_cents integer not null default 0 check (price_cents >= 0),
  -- null means unlimited places
  capacity integer check (capacity is null or capacity > 0),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index live_sessions_starts_at_idx on public.live_sessions (starts_at);

-- The joining link is kept apart from the public listing so that only people
-- who have registered can see it.
create table public.live_session_links (
  session_id uuid primary key references public.live_sessions (id) on delete cascade,
  join_url text not null default '',
  passcode text,
  recording_url text,
  updated_at timestamptz not null default now()
);

create table public.live_registrations (
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, session_id)
);
create index live_registrations_session_id_idx on public.live_registrations (session_id);

-- ---------------------------------------------------------------------------
-- Leads: enquiries, bookings, investor interest
-- ---------------------------------------------------------------------------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 160),
  subject text not null default '' check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  consent boolean not null default false,
  status public.lead_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index enquiries_user_id_idx on public.enquiries (user_id);
create index enquiries_service_id_idx on public.enquiries (service_id);
create index enquiries_created_at_idx on public.enquiries (created_at desc);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 160),
  preferred_date date not null,
  preferred_time text not null check (char_length(preferred_time) <= 40),
  mode public.booking_mode not null default 'online',
  notes text check (notes is null or char_length(notes) <= 5000),
  consent boolean not null default false,
  -- Copied from the service when the booking is made (see trigger below).
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  deposit_paid_at timestamptz,
  status public.booking_status not null default 'requested',
  meeting_link text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_service_id_idx on public.bookings (service_id);
create index bookings_created_at_idx on public.bookings (created_at desc);

alter table public.orders
  add column live_session_id uuid references public.live_sessions (id) on delete restrict,
  add column booking_id uuid references public.bookings (id) on delete restrict,
  add constraint orders_item_matches_kind check (
    (kind = 'course' and course_id is not null and live_session_id is null and booking_id is null)
    or (kind = 'live_session' and live_session_id is not null and course_id is null and booking_id is null)
    or (kind = 'consultation' and booking_id is not null and course_id is null and live_session_id is null)
  );
create index orders_live_session_id_idx on public.orders (live_session_id);
create index orders_booking_id_idx on public.orders (booking_id);

-- The deposit is always taken from the service, never from the visitor's form.
create or replace function private.set_booking_deposit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.deposit_paid_at := null;
  new.deposit_cents := coalesce(
    (select booking_deposit_cents from public.services where id = new.service_id), 0);
  return new;
end;
$$;
create trigger bookings_set_deposit
  before insert on public.bookings
  for each row execute function private.set_booking_deposit();

create table public.investor_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40),
  organisation text check (organisation is null or char_length(organisation) <= 160),
  investor_type text not null default '' check (char_length(investor_type) <= 80),
  ticket_range text not null default '' check (char_length(ticket_range) <= 80),
  message text check (message is null or char_length(message) <= 5000),
  consent boolean not null default false,
  status public.lead_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index investor_leads_created_at_idx on public.investor_leads (created_at desc);

-- updated_at triggers
do $$
declare
  t text;
begin
  foreach t in array array[
    'services', 'team_members', 'case_studies', 'testimonials', 'courses',
    'course_modules', 'lessons', 'lesson_contents', 'orders', 'enrolments',
    'live_sessions', 'live_session_links', 'discount_codes',
    'enquiries', 'bookings', 'investor_leads'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function private.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create or replace function private.is_enrolled(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.enrolments
    where user_id = (select auth.uid())
      and course_id = p_course_id
      and status in ('active', 'completed')
  );
$$;

create or replace function private.can_read_lesson(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = p_lesson_id
      and (
        (l.is_preview and c.published)
        or exists (
          select 1 from public.enrolments e
          where e.user_id = (select auth.uid())
            and e.course_id = l.course_id
            and e.status in ('active', 'completed')
        )
      )
  );
$$;

grant usage on schema private to anon, authenticated, service_role;
revoke execute on all functions in schema private from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.is_staff() to anon, authenticated, service_role;
grant execute on function private.is_enrolled(uuid) to anon, authenticated, service_role;
grant execute on function private.can_read_lesson(uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.team_members enable row level security;
alter table public.case_studies enable row level security;
alter table public.testimonials enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_contents enable row level security;
alter table public.orders enable row level security;
alter table public.discount_codes enable row level security;
alter table public.enrolments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_session_links enable row level security;
alter table public.live_registrations enable row level security;
alter table public.enquiries enable row level security;
alter table public.bookings enable row level security;
alter table public.investor_leads enable row level security;

-- Profiles: read your own, admins read all. Members may only edit contact
-- fields (enforced with column privileges below), never their role.
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone, company) on public.profiles to authenticated;

-- Role changes are made by an admin through this function only.
create or replace function public.set_user_role(p_user_id uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can change roles' using errcode = '42501';
  end if;
  if p_user_id = (select auth.uid()) and p_role <> 'admin' then
    raise exception 'You cannot remove your own admin access' using errcode = '42501';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
end;
$$;
revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

-- Published content is readable by everyone; staff (admins and editors) manage it.
do $$
declare
  t text;
begin
  foreach t in array array['services', 'team_members', 'case_studies', 'testimonials', 'courses', 'live_sessions']
  loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (published or (select private.is_staff()))',
      t || ': read published', t
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_staff()))',
      t || ': staff insert', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()))',
      t || ': staff update', t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_staff()))',
      t || ': staff delete', t
    );
  end loop;
end;
$$;

-- Course outline follows the course's published flag.
create policy "course_modules: read published" on public.course_modules
  for select to anon, authenticated
  using (
    (select private.is_staff())
    or exists (select 1 from public.courses c where c.id = course_id and c.published)
  );
create policy "course_modules: staff insert" on public.course_modules
  for insert to authenticated with check ((select private.is_staff()));
create policy "course_modules: staff update" on public.course_modules
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "course_modules: staff delete" on public.course_modules
  for delete to authenticated using ((select private.is_staff()));

create policy "lessons: read published" on public.lessons
  for select to anon, authenticated
  using (
    (select private.is_staff())
    or exists (select 1 from public.courses c where c.id = course_id and c.published)
  );
create policy "lessons: staff insert" on public.lessons
  for insert to authenticated with check ((select private.is_staff()));
create policy "lessons: staff update" on public.lessons
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "lessons: staff delete" on public.lessons
  for delete to authenticated using ((select private.is_staff()));

-- Lesson bodies: preview lessons for everyone, the rest for enrolled users.
create policy "lesson_contents: read if entitled" on public.lesson_contents
  for select to anon, authenticated
  using ((select private.is_staff()) or private.can_read_lesson(lesson_id));
create policy "lesson_contents: staff insert" on public.lesson_contents
  for insert to authenticated with check ((select private.is_staff()));
create policy "lesson_contents: staff update" on public.lesson_contents
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "lesson_contents: staff delete" on public.lesson_contents
  for delete to authenticated using ((select private.is_staff()));

-- Orders and enrolments are written by the server (secret key) only, so a
-- user can never grant themselves access to a paid course.
create policy "orders: read own or admin" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "enrolments: read own or admin" on public.enrolments
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "enrolments: admin update" on public.enrolments
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

revoke insert, update, delete on public.orders from anon, authenticated;

create policy "discount_codes: admin read" on public.discount_codes
  for select to authenticated using ((select private.is_admin()));
create policy "discount_codes: admin insert" on public.discount_codes
  for insert to authenticated with check ((select private.is_admin()));
create policy "discount_codes: admin update" on public.discount_codes
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "discount_codes: admin delete" on public.discount_codes
  for delete to authenticated using ((select private.is_admin()));
revoke insert, delete on public.enrolments from anon, authenticated;

-- Progress: a learner ticks off lessons in courses they are enrolled in.
create policy "lesson_progress: read own or admin" on public.lesson_progress
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "lesson_progress: insert own when enrolled" on public.lesson_progress
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_enrolled(course_id)
    and exists (select 1 from public.lessons l where l.id = lesson_id and l.course_id = lesson_progress.course_id)
  );
create policy "lesson_progress: delete own" on public.lesson_progress
  for delete to authenticated
  using (user_id = (select auth.uid()));
revoke update on public.lesson_progress from anon, authenticated;

-- Live sessions: the listing is public (policies created above); the joining
-- link is visible only to registered users.
create policy "live_session_links: read if registered" on public.live_session_links
  for select to authenticated
  using (
    (select private.is_staff())
    or exists (
      select 1 from public.live_registrations r
      where r.session_id = live_session_links.session_id and r.user_id = (select auth.uid())
    )
  );
create policy "live_session_links: staff insert" on public.live_session_links
  for insert to authenticated with check ((select private.is_staff()));
create policy "live_session_links: staff update" on public.live_session_links
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "live_session_links: staff delete" on public.live_session_links
  for delete to authenticated using ((select private.is_staff()));

create policy "live_registrations: read own or admin" on public.live_registrations
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "live_registrations: cancel own" on public.live_registrations
  for delete to authenticated
  using (user_id = (select auth.uid()));
-- Registration goes through register_for_live_session() so capacity is enforced.
revoke insert, update on public.live_registrations from anon, authenticated;

create or replace function public.register_for_live_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_session public.live_sessions%rowtype;
  v_taken integer;
begin
  if v_user is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  -- Lock the session row so two people cannot take the last place at once.
  select * into v_session from public.live_sessions
    where id = p_session_id and published for update;
  if not found then
    raise exception 'SESSION_NOT_FOUND';
  end if;
  if v_session.starts_at + make_interval(mins => v_session.duration_minutes) < now() then
    raise exception 'SESSION_ENDED';
  end if;
  if v_session.price_cents > 0 then
    -- Paid sessions are joined by paying for an order.
    raise exception 'SESSION_PAID';
  end if;
  if exists (select 1 from public.live_registrations where user_id = v_user and session_id = p_session_id) then
    return;
  end if;
  if v_session.capacity is not null then
    select count(*) into v_taken from public.live_registrations where session_id = p_session_id;
    if v_taken >= v_session.capacity then
      raise exception 'SESSION_FULL';
    end if;
  end if;
  insert into public.live_registrations (user_id, session_id) values (v_user, p_session_id);
end;
$$;
revoke execute on function public.register_for_live_session(uuid) from public, anon;
grant execute on function public.register_for_live_session(uuid) to authenticated;

-- Places taken per session, for "x places left" on the public listing.
create or replace function public.live_session_places_taken()
returns table (session_id uuid, taken bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select r.session_id, count(*) from public.live_registrations r group by r.session_id;
$$;
grant execute on function public.live_session_places_taken() to anon, authenticated;

-- Certificates are issued by the server and are publicly verifiable by serial
-- through verify_certificate() below; the table itself is private.
create policy "certificates: read own or admin" on public.certificates
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
revoke insert, update, delete on public.certificates from anon, authenticated;

create or replace function public.verify_certificate(p_serial text)
returns table (serial text, recipient_name text, course_title text, issued_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select c.serial, c.recipient_name, c.course_title, c.issued_at
  from public.certificates c
  where c.serial = upper(p_serial);
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- Leads: anyone can submit; only admins (and the submitter, for bookings and
-- enquiries made while signed in) can read them back.
create policy "enquiries: anyone can submit" on public.enquiries
  for insert to anon, authenticated
  with check (
    status = 'new' and admin_notes is null and consent
    and (user_id is null or user_id = (select auth.uid()))
  );
create policy "enquiries: read own or admin" on public.enquiries
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "enquiries: admin update" on public.enquiries
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "enquiries: admin delete" on public.enquiries
  for delete to authenticated using ((select private.is_admin()));

create policy "bookings: anyone can request" on public.bookings
  for insert to anon, authenticated
  with check (
    status = 'requested' and admin_notes is null and meeting_link is null and consent
    and (user_id is null or user_id = (select auth.uid()))
  );
create policy "bookings: read own or admin" on public.bookings
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "bookings: admin update" on public.bookings
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "bookings: admin delete" on public.bookings
  for delete to authenticated using ((select private.is_admin()));

create policy "investor_leads: anyone can submit" on public.investor_leads
  for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null and consent);
create policy "investor_leads: admin read" on public.investor_leads
  for select to authenticated using ((select private.is_admin()));
create policy "investor_leads: admin update" on public.investor_leads
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "investor_leads: admin delete" on public.investor_leads
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Server-side operations (called with the secret key only)
-- ---------------------------------------------------------------------------

-- Works out what a discount code takes off. Raises DISCOUNT_INVALID if the
-- code does not exist, is switched off, expired, used up or not for this item.
create or replace function public.quote_discount(
  p_code text, p_kind public.order_kind, p_subtotal_cents integer
)
returns table (discount_code_id uuid, discount_cents integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v public.discount_codes%rowtype;
begin
  select * into v from public.discount_codes
  where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found
    or not v.active
    or (v.starts_at is not null and v.starts_at > now())
    or (v.expires_at is not null and v.expires_at < now())
    or (v.max_uses is not null and v.used_count >= v.max_uses)
    or (v.applies_to is not null and v.applies_to <> p_kind)
  then
    raise exception 'DISCOUNT_INVALID';
  end if;
  discount_code_id := v.id;
  discount_cents := least(
    p_subtotal_cents,
    case v.kind
      when 'percent' then round(p_subtotal_cents * v.value / 100.0)::integer
      else v.value
    end
  );
  return next;
end;
$$;
revoke execute on function public.quote_discount(text, public.order_kind, integer) from public, anon;
grant execute on function public.quote_discount(text, public.order_kind, integer) to authenticated, service_role;

-- Creates a pending order. The price always comes from the database, never
-- from the browser. Raises a named error if the item cannot be bought.
create or replace function public.create_order(
  p_user_id uuid, p_kind public.order_kind, p_item_id uuid, p_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_subtotal integer;
  v_description text;
  v_discount_id uuid;
  v_discount integer := 0;
  v_order_id uuid;
  v_session public.live_sessions%rowtype;
  v_booking public.bookings%rowtype;
begin
  if p_kind = 'course' then
    select price_cents, title into v_subtotal, v_description
      from public.courses where id = p_item_id and published;
    if not found then raise exception 'ITEM_NOT_FOUND'; end if;
    if exists (
      select 1 from public.enrolments
      where user_id = p_user_id and course_id = p_item_id and status in ('active', 'completed')
    ) then
      raise exception 'ALREADY_OWNED';
    end if;
  elsif p_kind = 'live_session' then
    select * into v_session from public.live_sessions where id = p_item_id and published;
    if not found then raise exception 'ITEM_NOT_FOUND'; end if;
    if v_session.starts_at + make_interval(mins => v_session.duration_minutes) < now() then
      raise exception 'SESSION_ENDED';
    end if;
    if exists (
      select 1 from public.live_registrations where user_id = p_user_id and session_id = p_item_id
    ) then
      raise exception 'ALREADY_OWNED';
    end if;
    if v_session.capacity is not null and (
      select count(*) from public.live_registrations where session_id = p_item_id
    ) >= v_session.capacity then
      raise exception 'SESSION_FULL';
    end if;
    v_subtotal := v_session.price_cents;
    v_description := v_session.title;
  else
    select * into v_booking from public.bookings where id = p_item_id and user_id = p_user_id;
    if not found then raise exception 'ITEM_NOT_FOUND'; end if;
    if v_booking.deposit_cents = 0 or v_booking.deposit_paid_at is not null
      or v_booking.status = 'cancelled' then
      raise exception 'NOTHING_TO_PAY';
    end if;
    v_subtotal := v_booking.deposit_cents;
    v_description := 'Consultation deposit, ' || to_char(v_booking.preferred_date, 'FMDD Mon YYYY');
  end if;

  if coalesce(trim(p_code), '') <> '' then
    select q.discount_code_id, q.discount_cents into v_discount_id, v_discount
      from public.quote_discount(p_code, p_kind, v_subtotal) q;
  end if;

  insert into public.orders (
    user_id, kind, course_id, live_session_id, booking_id, description,
    subtotal_cents, discount_cents, amount_cents, discount_code_id
  ) values (
    p_user_id, p_kind,
    case when p_kind = 'course' then p_item_id end,
    case when p_kind = 'live_session' then p_item_id end,
    case when p_kind = 'consultation' then p_item_id end,
    v_description, v_subtotal, v_discount, v_subtotal - v_discount, v_discount_id
  )
  returning id into v_order_id;
  return v_order_id;
end;
$$;
revoke execute on function public.create_order(uuid, public.order_kind, uuid, text) from public, anon, authenticated;
grant execute on function public.create_order(uuid, public.order_kind, uuid, text) to service_role;

-- Marks an order paid and delivers what was bought, exactly once.
create or replace function public.complete_order(p_order_id uuid, p_provider_payment_id text)
returns public.order_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;
  if v_order.status = 'paid' then
    return v_order.status;
  end if;

  update public.orders
  set status = 'paid', paid_at = now(), provider_payment_id = p_provider_payment_id
  where id = p_order_id;

  if v_order.discount_code_id is not null then
    update public.discount_codes set used_count = used_count + 1
    where id = v_order.discount_code_id;
  end if;

  if v_order.kind = 'course' then
    insert into public.enrolments (user_id, course_id, order_id)
    values (v_order.user_id, v_order.course_id, v_order.id)
    on conflict (user_id, course_id)
    do update set status = 'active', order_id = excluded.order_id
    where public.enrolments.status = 'refunded';
  elsif v_order.kind = 'live_session' then
    -- They have paid, so they get the seat even if the room filled meanwhile.
    insert into public.live_registrations (user_id, session_id)
    values (v_order.user_id, v_order.live_session_id)
    on conflict do nothing;
  else
    update public.bookings set deposit_paid_at = now()
    where id = v_order.booking_id and deposit_paid_at is null;
  end if;

  return 'paid';
end;
$$;
revoke execute on function public.complete_order(uuid, text) from public, anon, authenticated;
grant execute on function public.complete_order(uuid, text) to service_role;

-- Free courses: a signed-in user can enrol without an order.
create or replace function public.enrol_free(p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.courses where id = p_course_id and published and price_cents = 0
  ) then
    raise exception 'This course is not free to join' using errcode = '42501';
  end if;
  insert into public.enrolments (user_id, course_id)
  values (v_user, p_course_id)
  on conflict (user_id, course_id) do nothing;
end;
$$;
revoke execute on function public.enrol_free(uuid) from public, anon;
grant execute on function public.enrol_free(uuid) to authenticated;

-- Issues a certificate once every lesson in the course is complete.
create or replace function public.issue_certificate(p_course_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_total integer;
  v_done integer;
  v_serial text;
  v_name text;
  v_email text;
  v_title text;
begin
  if v_user is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if not private.is_enrolled(p_course_id) then
    raise exception 'Not enrolled in this course' using errcode = '42501';
  end if;

  select count(*) into v_total from public.lessons where course_id = p_course_id;
  select count(*) into v_done from public.lesson_progress
    where course_id = p_course_id and user_id = v_user;
  if v_total = 0 or v_done < v_total then
    return null;
  end if;

  select nullif(full_name, ''), email into v_name, v_email from public.profiles where id = v_user;
  v_name := coalesce(v_name, v_email);
  select title into v_title from public.courses where id = p_course_id;

  insert into public.certificates (user_id, course_id, recipient_name, course_title)
  values (v_user, p_course_id, v_name, v_title)
  on conflict (user_id, course_id) do nothing;

  update public.enrolments
  set status = 'completed', completed_at = coalesce(completed_at, now())
  where user_id = v_user and course_id = p_course_id and status = 'active';

  select serial into v_serial from public.certificates
    where user_id = v_user and course_id = p_course_id;
  return v_serial;
end;
$$;
revoke execute on function public.issue_certificate(uuid) from public, anon;
grant execute on function public.issue_certificate(uuid) to authenticated;

-- Headline numbers for the admin overview.
create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'new_enquiries', (select count(*) from public.enquiries where status = 'new'),
    'pending_bookings', (select count(*) from public.bookings where status = 'requested'),
    'new_investor_leads', (select count(*) from public.investor_leads where status = 'new'),
    'members', (select count(*) from public.profiles),
    'active_enrolments', (select count(*) from public.enrolments where status in ('active', 'completed')),
    'revenue_cents', (select coalesce(sum(amount_cents), 0) from public.orders where status = 'paid'),
    'revenue_30d_cents', (
      select coalesce(sum(amount_cents), 0) from public.orders
      where status = 'paid' and paid_at >= now() - interval '30 days'
    )
  );
end;
$$;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
