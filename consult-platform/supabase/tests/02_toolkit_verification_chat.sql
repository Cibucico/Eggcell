-- Tests for the toolkit, women-only verification and live chat rules.
-- Runs after 01_access_rules.sql on the same database (users already exist).
\set ON_ERROR_STOP on

create or replace function pg_temp.expect(ok boolean, label text) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAILED: %', label; end if;
  raise notice 'ok: %', label;
end $$;

create or replace function pg_temp.fails(stmt text, label text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'ok: % (%)', label, sqlerrm;
    return;
  end;
  raise exception 'FAILED (statement succeeded): %', label;
end $$;

reset role;
update public.profiles set role = 'admin' where id = '11111111-1111-4111-8111-111111111111';
update public.profiles set role = 'member' where id in ('22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333');
insert into auth.users (id, email, raw_user_meta_data) values
  ('44444444-4444-4444-8444-444444444444', 'editor@example.test', '{"full_name":"Esi Editor"}');
update public.profiles set role = 'editor' where id = '44444444-4444-4444-8444-444444444444';

insert into public.toolkit_articles (category, slug, title, blocks, published) values
  ('operations', 'published-article', 'Published', '[{"type":"text","markdown":"Hello"}]', true),
  ('finance', 'draft-article', 'Draft', '[]', false);

-- ---- visitor ---------------------------------------------------------------
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.expect((select count(*) = 1 from public.toolkit_articles), 'visitors read published toolkit articles only');
select pg_temp.fails($$insert into public.toolkit_articles (category, slug, title) values ('finance', 'x', 'x')$$, 'visitors cannot write toolkit articles');
select pg_temp.expect((select count(*) = 0 from public.chat_conversations), 'visitors cannot read chat conversations');
select pg_temp.fails($$insert into public.chat_conversations (visitor_name, visitor_email, token_hash) values ('x', 'x@example.test', 'x')$$, 'visitors cannot start chats directly');

-- ---- member ----------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
select pg_temp.fails($$update public.profiles set verification_status = 'approved' where id = auth.uid()$$, 'member cannot approve herself');
select pg_temp.fails($$update public.profiles set id_number_hash = 'x' where id = auth.uid()$$, 'member cannot set her ID hash');
select pg_temp.fails($$select public.set_verification(auth.uid(), 'approved')$$, 'member cannot call set_verification');
select pg_temp.expect((select count(*) = 0 from public.chat_messages), 'members cannot read chat messages');
update public.toolkit_articles set title = 'Hacked' where slug = 'published-article';
select pg_temp.expect((select title = 'Published' from public.toolkit_articles where slug = 'published-article'), 'members cannot edit toolkit articles');

-- ---- editor ----------------------------------------------------------------
select set_config('request.jwt.claim.sub', '44444444-4444-4444-8444-444444444444', false);
select pg_temp.expect((select count(*) = 2 from public.toolkit_articles), 'editor sees draft articles');
update public.toolkit_articles set title = 'Edited by editor' where slug = 'draft-article';
select pg_temp.expect((select title = 'Edited by editor' from public.toolkit_articles where slug = 'draft-article'), 'editor edits toolkit articles');
select pg_temp.expect((select count(*) = 0 from public.chat_conversations), 'editor cannot read chats');
select pg_temp.fails($$select public.set_verification('22222222-2222-4222-8222-222222222222', 'approved')$$, 'editor cannot verify members');

-- ---- server (secret key): a visitor starts a chat ----------------------------
reset role;
set role service_role;
insert into public.chat_conversations (id, visitor_name, visitor_email, token_hash)
  values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Visitor', 'v@example.test', 'hash-1');
insert into public.chat_messages (conversation_id, sender, body)
  values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'visitor', 'Hello, can you help?');
select pg_temp.expect((select unread_for_staff from public.chat_conversations where token_hash = 'hash-1'), 'new visitor message is unread for staff');

-- ---- admin -----------------------------------------------------------------
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
select pg_temp.expect((select count(*) = 1 from public.chat_conversations), 'admin reads chats');
insert into public.chat_messages (conversation_id, sender, staff_id, body)
  values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'staff', auth.uid(), 'Yes, how can we help?');
select pg_temp.expect((select not unread_for_staff and status = 'in_progress' from public.chat_conversations where token_hash = 'hash-1'), 'staff reply marks the chat answered');
select pg_temp.fails($$insert into public.chat_messages (conversation_id, sender, staff_id, body) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'visitor', auth.uid(), 'Pretending')$$, 'admin cannot post as the visitor');
select pg_temp.fails($$insert into public.chat_messages (conversation_id, sender, staff_id, body) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'staff', '44444444-4444-4444-8444-444444444444', 'As someone else')$$, 'admin cannot post as another staff member');

select public.set_verification('22222222-2222-4222-8222-222222222222', 'approved', 'ID checked');
select pg_temp.expect((select verification_status = 'approved' and verified_at is not null from public.profiles where id = '22222222-2222-4222-8222-222222222222'), 'admin approves a member');
select public.set_verification('33333333-3333-4333-8333-333333333333', 'rejected', 'Male ID');
select pg_temp.expect((select verification_status = 'rejected' from public.profiles where id = '33333333-3333-4333-8333-333333333333'), 'admin rejects a member');
select pg_temp.expect((select (public.admin_overview() ->> 'unread_chats') is not null), 'admin overview counts chats and verifications');

reset role;
-- The ID hash is unique, so one ID number cannot open two accounts.
update public.profiles set id_number_hash = 'same-hash' where id = '22222222-2222-4222-8222-222222222222';
select pg_temp.fails($$update public.profiles set id_number_hash = 'same-hash' where id = '33333333-3333-4333-8333-333333333333'$$, 'one ID number cannot open two accounts');
\echo ALL TOOLKIT, VERIFICATION AND CHAT TESTS PASSED
