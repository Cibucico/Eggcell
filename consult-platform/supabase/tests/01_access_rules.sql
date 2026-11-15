-- Access-rule tests. Each block raises an exception if a rule is broken.
\set ON_ERROR_STOP on

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'admin@example.test', '{"full_name":"Ada Admin"}'),
  ('22222222-2222-4222-8222-222222222222', 'learner@example.test', '{"full_name":"Lebo Learner"}'),
  ('33333333-3333-4333-8333-333333333333', 'other@example.test', '{"full_name":"Olwethu Other"}');
update public.profiles set role = 'admin' where id = '11111111-1111-4111-8111-111111111111';

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

select pg_temp.expect((select count(*) = 3 from public.profiles), 'profile created for each new user');

-- ---- anonymous visitor --------------------------------------------------
set role anon;
select set_config('request.jwt.claim.sub', '', false);

select pg_temp.expect((select count(*) > 0 from public.services), 'anon reads published services');
select pg_temp.expect((select count(*) > 0 from public.lessons), 'anon reads course outline');
select pg_temp.expect(
  (select count(*) from public.lesson_contents) = (select count(*) from public.lessons where is_preview),
  'anon reads preview lesson bodies only');
select pg_temp.expect((select count(*) = 0 from public.profiles), 'anon cannot read profiles');
select pg_temp.expect((select count(*) = 2 from public.live_sessions), 'anon reads published live sessions');
select pg_temp.expect((select count(*) = 0 from public.live_session_links), 'anon cannot read joining links');
select pg_temp.fails($$select public.register_for_live_session((select id from public.live_sessions limit 1))$$, 'anon cannot register for a live session');

insert into public.enquiries (name, email, message, consent) values ('A Visitor', 'v@example.test', 'Hello', true);
select pg_temp.expect((select count(*) = 0 from public.enquiries), 'anon cannot read enquiries back');
select pg_temp.fails($$insert into public.enquiries (name, email, message, consent, status) values ('x','x@example.test','x',true,'closed')$$, 'anon cannot set enquiry status');
select pg_temp.fails($$insert into public.enquiries (name, email, message, consent) values ('x','x@example.test','x',false)$$, 'enquiry requires consent');
select pg_temp.fails($$insert into public.enquiries (name, email, message, consent, user_id) values ('x','x@example.test','x',true,'22222222-2222-4222-8222-222222222222')$$, 'anon cannot attribute an enquiry to a user');
insert into public.bookings (name, email, preferred_date, preferred_time, consent) values ('A Visitor', 'v@example.test', current_date + 7, '10:00', true);
insert into public.investor_leads (name, email, consent) values ('An Investor', 'i@example.test', true);
select pg_temp.expect((select count(*) = 0 from public.investor_leads), 'anon cannot read investor leads');
select pg_temp.fails($$insert into public.services (slug, title) values ('hack', 'Hack')$$, 'anon cannot create services');
select pg_temp.fails($$select public.complete_order(gen_random_uuid(), 'x')$$, 'anon cannot complete orders');
select pg_temp.fails($$select public.admin_overview()$$, 'anon cannot read admin overview');

-- ---- signed-in learner --------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);

select pg_temp.expect((select count(*) = 1 from public.profiles), 'member reads only own profile');
update public.profiles set full_name = 'Lebo L', phone = '0820000000' where id = (select auth.uid());
select pg_temp.expect((select full_name = 'Lebo L' from public.profiles), 'member edits own contact details');
select pg_temp.fails($$update public.profiles set role = 'admin' where id = '22222222-2222-4222-8222-222222222222'$$, 'member cannot promote self');
select pg_temp.fails($$select public.set_user_role('22222222-2222-4222-8222-222222222222', 'admin')$$, 'member cannot call set_user_role');
select pg_temp.fails($$insert into public.enrolments (user_id, course_id) select auth.uid(), id from public.courses where price_cents > 0 limit 1$$, 'member cannot self-enrol in a paid course');
select pg_temp.fails($$insert into public.orders (user_id, course_id, amount_cents, status) select auth.uid(), id, 0, 'paid' from public.courses limit 1$$, 'member cannot create orders');
select pg_temp.fails($$select public.enrol_free((select id from public.courses where price_cents > 0 limit 1))$$, 'enrol_free rejects paid courses');
select pg_temp.fails($$insert into public.lesson_progress (user_id, lesson_id, course_id) select auth.uid(), id, course_id from public.lessons limit 1$$, 'no progress without enrolment');

select public.enrol_free((select id from public.courses where price_cents = 0 limit 1));
select pg_temp.expect((select count(*) = 1 from public.enrolments), 'member enrols in a free course');
select pg_temp.expect(
  (select count(*) from public.lesson_contents lc join public.lessons l on l.id = lc.lesson_id
    where l.course_id = (select course_id from public.enrolments)) =
  (select count(*) from public.lessons where course_id = (select course_id from public.enrolments)),
  'enrolled member reads every lesson body in that course');
select pg_temp.expect(
  (select count(*) = 0 from public.lesson_contents lc join public.lessons l on l.id = lc.lesson_id
    join public.courses c on c.id = l.course_id where c.price_cents > 0 and not l.is_preview),
  'member cannot read paid lesson bodies');

select pg_temp.expect((select public.issue_certificate((select course_id from public.enrolments)) is null), 'no certificate before completion');
insert into public.lesson_progress (user_id, lesson_id, course_id)
  select auth.uid(), id, course_id from public.lessons where course_id = (select course_id from public.enrolments);
select pg_temp.fails($$insert into public.lesson_progress (user_id, lesson_id, course_id) select '33333333-3333-4333-8333-333333333333', id, course_id from public.lessons where course_id = (select course_id from public.enrolments) limit 1$$, 'cannot record progress for someone else');
select pg_temp.expect((select public.issue_certificate((select course_id from public.enrolments)) is not null), 'certificate issued on completion');
select pg_temp.expect((select status = 'completed' from public.enrolments), 'enrolment marked completed');
select pg_temp.expect((select count(*) = 1 from public.verify_certificate((select serial from public.certificates))), 'certificate verifies by serial');
select pg_temp.fails($$update public.certificates set recipient_name = 'Someone Else'$$, 'member cannot edit certificates');

insert into public.bookings (user_id, name, email, preferred_date, preferred_time, consent)
  values (auth.uid(), 'Lebo', 'learner@example.test', current_date + 3, '14:00', true);
select pg_temp.expect((select count(*) = 1 from public.bookings), 'member sees only own bookings');
update public.bookings set status = 'confirmed';
select pg_temp.expect((select status = 'requested' from public.bookings), 'member cannot confirm own booking');

-- live sessions
select pg_temp.expect((select count(*) = 0 from public.live_session_links), 'joining link hidden before registering');
select pg_temp.fails($$insert into public.live_registrations (user_id, session_id) select auth.uid(), id from public.live_sessions limit 1$$, 'cannot register by direct insert');
select public.register_for_live_session((select id from public.live_sessions where capacity is null limit 1));
select public.register_for_live_session((select id from public.live_sessions where capacity is null limit 1));
select pg_temp.expect((select count(*) = 1 from public.live_registrations), 'registering twice keeps one registration');
select pg_temp.expect((select count(*) = 1 from public.live_session_links), 'joining link visible after registering');
select pg_temp.expect((select sum(taken) = 1 from public.live_session_places_taken()), 'places taken are counted');

-- ---- another member -----------------------------------------------------
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', false);
select pg_temp.expect((select count(*) = 0 from public.enrolments), 'members cannot see each other''s enrolments');
select pg_temp.expect((select count(*) = 0 from public.bookings), 'members cannot see each other''s bookings');
select pg_temp.expect((select count(*) = 0 from public.certificates), 'members cannot list each other''s certificates');

select pg_temp.expect((select count(*) = 0 from public.live_registrations), 'members cannot see each other''s registrations');
reset role;
update public.live_sessions set capacity = 1 where capacity is null;
update public.live_sessions set starts_at = now() - interval '2 days' where slug = 'funding-clinic';
set role authenticated;
select pg_temp.fails($$select public.register_for_live_session((select id from public.live_sessions where slug = 'reading-your-numbers'))$$, 'full session rejects new registrations');
select pg_temp.fails($$select public.register_for_live_session((select id from public.live_sessions where slug = 'funding-clinic'))$$, 'ended session rejects registrations');

-- ---- payment completion (server, secret key) ----------------------------
reset role;
insert into public.orders (id, user_id, course_id, amount_cents)
  select 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', id, price_cents
  from public.courses where price_cents > 0 order by sort_order limit 1;
set role service_role;
select pg_temp.expect(public.complete_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'pf-1') = 'paid', 'order completes');
select pg_temp.expect(public.complete_order('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'pf-1') = 'paid', 'completing twice is harmless');
select pg_temp.expect((select count(*) = 1 from public.enrolments where user_id = '33333333-3333-4333-8333-333333333333'), 'payment enrols the buyer exactly once');

-- ---- admin --------------------------------------------------------------
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
select pg_temp.expect((select count(*) = 3 from public.profiles), 'admin reads all profiles');
select pg_temp.expect((select count(*) = 1 from public.enquiries), 'admin reads enquiries');
select pg_temp.expect((select count(*) = 1 from public.investor_leads), 'admin reads investor leads');
select pg_temp.expect((select count(*) = 2 from public.bookings), 'admin reads all bookings');
update public.bookings set status = 'confirmed', meeting_link = 'https://meet.example.test/x';
select pg_temp.expect((select count(*) = 2 from public.bookings where status = 'confirmed'), 'admin confirms bookings');
insert into public.services (slug, title, published) values ('draft-service', 'Draft', false);
update public.services set title = 'Draft 2' where slug = 'draft-service';
select pg_temp.expect((select (public.admin_overview() ->> 'revenue_cents')::int > 0), 'admin overview reports revenue');
select public.set_user_role('33333333-3333-4333-8333-333333333333', 'admin');
select pg_temp.expect((select role = 'admin' from public.profiles where id = '33333333-3333-4333-8333-333333333333'), 'admin promotes a user');
select pg_temp.fails($$select public.set_user_role('11111111-1111-4111-8111-111111111111', 'member')$$, 'admin cannot demote self');

set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.expect((select count(*) = 0 from public.services where slug = 'draft-service'), 'unpublished content hidden from visitors');
reset role;
\echo ALL ACCESS-RULE TESTS PASSED
