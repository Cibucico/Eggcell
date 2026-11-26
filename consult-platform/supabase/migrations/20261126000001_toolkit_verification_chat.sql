-- Toolkit library, women-only verification and live chat.

-- ---------------------------------------------------------------------------
-- Toolkit: free articles and videos on operations, marketing and finance
-- ---------------------------------------------------------------------------
create type public.toolkit_category as enum ('operations', 'marketing', 'finance');

create table public.toolkit_articles (
  id uuid primary key default gen_random_uuid(),
  category public.toolkit_category not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  -- Same content blocks as course lessons (text, video, callout, reveal ...).
  blocks jsonb not null default '[]'::jsonb check (jsonb_typeof(blocks) = 'array'),
  reading_minutes integer not null default 0 check (reading_minutes >= 0),
  featured boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index toolkit_articles_category_idx on public.toolkit_articles (category, sort_order);

create trigger toolkit_articles_set_updated_at
  before update on public.toolkit_articles
  for each row execute function private.set_updated_at();

alter table public.toolkit_articles enable row level security;
create policy "toolkit_articles: read published" on public.toolkit_articles
  for select to anon, authenticated using (published or (select private.is_staff()));
create policy "toolkit_articles: staff insert" on public.toolkit_articles
  for insert to authenticated with check ((select private.is_staff()));
create policy "toolkit_articles: staff update" on public.toolkit_articles
  for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "toolkit_articles: staff delete" on public.toolkit_articles
  for delete to authenticated using ((select private.is_staff()));

-- ---------------------------------------------------------------------------
-- Verification (women-only sites)
-- ---------------------------------------------------------------------------
-- unverified: no check done (the default, and the state of any account made
--             outside the site's own sign-up form)
-- pending:    ID number checked by the site; waiting for an admin
-- approved / rejected: decided by an admin
create type public.verification_status as enum ('unverified', 'pending', 'approved', 'rejected');

alter table public.profiles
  add column verification_status public.verification_status not null default 'unverified',
  -- Keyed hash of the SA ID number, so one ID cannot open many accounts.
  -- The ID number itself is never stored.
  add column id_number_hash text unique,
  add column verified_at timestamptz,
  add column verification_note text check (verification_note is null or char_length(verification_note) <= 500);

-- Members cannot change these columns: the profile column grants from the
-- first migration only allow full_name, phone and company.

create or replace function public.set_verification(
  p_user_id uuid, p_status public.verification_status, p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can verify members' using errcode = '42501';
  end if;
  update public.profiles
  set verification_status = p_status,
      verified_at = case when p_status in ('approved', 'rejected') then now() else null end,
      verification_note = nullif(left(coalesce(p_note, ''), 500), '')
  where id = p_user_id;
end;
$$;
revoke execute on function public.set_verification(uuid, public.verification_status, text) from public, anon;
grant execute on function public.set_verification(uuid, public.verification_status, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Live chat answered by a person
-- ---------------------------------------------------------------------------
-- Visitors (signed in or not) reach these tables only through the server,
-- which checks a private token held in the visitor's cookie. There are no
-- policies for anon or members, so the tables are invisible to them.
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  visitor_name text not null check (char_length(visitor_name) between 1 and 120),
  visitor_email text not null check (char_length(visitor_email) between 3 and 254),
  token_hash text not null unique,
  status public.lead_status not null default 'new',
  unread_for_staff boolean not null default true,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index chat_conversations_last_idx on public.chat_conversations (last_message_at desc);
create index chat_conversations_user_id_idx on public.chat_conversations (user_id);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender text not null check (sender in ('visitor', 'staff')),
  staff_id uuid references public.profiles (id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index chat_messages_conversation_idx on public.chat_messages (conversation_id, created_at);
create index chat_messages_staff_id_idx on public.chat_messages (staff_id);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

create policy "chat_conversations: admin read" on public.chat_conversations
  for select to authenticated using ((select private.is_admin()));
create policy "chat_conversations: admin update" on public.chat_conversations
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "chat_conversations: admin delete" on public.chat_conversations
  for delete to authenticated using ((select private.is_admin()));

create policy "chat_messages: admin read" on public.chat_messages
  for select to authenticated using ((select private.is_admin()));
create policy "chat_messages: admin reply" on public.chat_messages
  for insert to authenticated
  with check ((select private.is_admin()) and sender = 'staff' and staff_id = (select auth.uid()));

-- A staff reply marks the conversation as answered and moves it up the list.
create or replace function private.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_conversations
  set last_message_at = new.created_at,
      unread_for_staff = (new.sender = 'visitor'),
      status = case
        when new.sender = 'staff' and status = 'new' then 'in_progress'::public.lead_status
        when new.sender = 'visitor' and status = 'closed' then 'in_progress'::public.lead_status
        else status
      end
  where id = new.conversation_id;
  return new;
end;
$$;
create trigger chat_messages_touch_conversation
  after insert on public.chat_messages
  for each row execute function private.touch_conversation();

-- Include the new counts in the admin overview.
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
    ),
    'pending_verifications', (select count(*) from public.profiles where verification_status = 'pending'),
    'unread_chats', (select count(*) from public.chat_conversations where unread_for_staff)
  );
end;
$$;
