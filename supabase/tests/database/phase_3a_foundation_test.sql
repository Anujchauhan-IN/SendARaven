begin;

select plan(61);

select has_schema('private', 'private schema exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('private', 'account_standing', 'account standing table exists');
select has_table('private', 'reserved_usernames', 'reserved Username table exists');
select has_table('public', 'city_dataset_versions', 'city dataset versions table exists');
select has_table('public', 'cities', 'cities table exists');
select has_table('public', 'raven_types', 'raven catalogue exists');

select ok(
  (select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.profiles'::regclass),
  'profiles uses forced RLS'
);
select ok(
  (select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.city_dataset_versions'::regclass),
  'city dataset versions use forced RLS'
);
select ok(
  (select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.cities'::regclass),
  'cities use forced RLS'
);
select ok(
  (select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.raven_types'::regclass),
  'raven types use forced RLS'
);
select ok(
  (select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'private.account_standing'::regclass),
  'account standing uses forced RLS'
);

select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anonymous users cannot read profiles');
select ok(has_table_privilege('authenticated', 'public.profiles', 'select'), 'authenticated users hold profile select grant');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'insert'), 'authenticated users cannot insert profiles directly');
select ok(has_column_privilege('authenticated', 'public.profiles', 'display_name', 'update'), 'authenticated users may update display name');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'username', 'update'), 'authenticated users cannot update Username');
select ok(has_function_privilege('authenticated', 'public.create_profile(text,text,uuid)', 'execute'), 'authenticated users may call profile creation');
select ok(not has_function_privilege('anon', 'public.create_profile(text,text,uuid)', 'execute'), 'anonymous users cannot call profile creation');
select ok(not has_function_privilege('authenticated', 'private.handle_new_auth_user()', 'execute'), 'authenticated users cannot execute privileged auth trigger function');
select ok(
  (select prosecdef from pg_catalog.pg_proc where oid = 'private.handle_new_auth_user()'::regprocedure),
  'auth trigger function is security definer'
);
select ok(
  exists (
    select 1
    from pg_catalog.pg_proc
    cross join lateral unnest(coalesce(proconfig, array[]::text[])) as setting
    where oid = 'private.handle_new_auth_user()'::regprocedure
      and setting like 'search_path=%'
  ),
  'auth trigger function pins its search path'
);

select results_eq(
  $$
    select code, display_name, speed_kmh, is_instant, sort_order
    from public.raven_types
    order by sort_order
  $$,
  $$
    values
      ('phantom'::text, 'Phantom Raven'::text, null::numeric, true, 1::smallint),
      ('swift'::text, 'Swift Raven'::text, 500::numeric, false, 2::smallint),
      ('courier'::text, 'Courier Raven'::text, 250::numeric, false, 3::smallint),
      ('wanderer'::text, 'Wanderer Raven'::text, 100::numeric, false, 4::smallint),
      ('old'::text, 'Old Raven'::text, 50::numeric, false, 5::smallint)
  $$,
  'raven catalogue contains exactly the approved names and speeds'
);

select throws_ok(
  $$ update public.raven_types set speed_kmh = 501 where code = 'swift' $$,
  '42501',
  'raven catalogue is immutable',
  'raven catalogue rejects privileged mutation'
);

select throws_ok(
  $$ truncate public.raven_types $$,
  '42501',
  'raven catalogue is immutable',
  'raven catalogue rejects privileged truncation'
);

insert into public.city_dataset_versions (
  id, source_name, source_version, licence_name, licence_url, is_active
) values
  (
    '10000000-0000-0000-0000-000000000001',
    'Phase 3A fixture',
    '1',
    'Test licence',
    'https://example.invalid/licence',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Phase 3A fixture',
    '0',
    'Test licence',
    'https://example.invalid/licence',
    false
  );

insert into public.cities (
  id, dataset_version_id, source_city_key, name, country_code, latitude, longitude, is_active
) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'fixture:active',
    'Active City',
    'GB',
    51.507400,
    -0.127800,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'fixture:inactive',
    'Inactive City',
    'GB',
    52.000000,
    -1.000000,
    false
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'fixture:inactive-dataset',
    'Inactive Dataset City',
    'GB',
    53.000000,
    -2.000000,
    true
  );

select throws_ok(
  $$
    insert into public.cities (
      dataset_version_id, source_city_key, name, country_code, latitude, longitude
    ) values (
      '10000000-0000-0000-0000-000000000001',
      'fixture:invalid-latitude',
      'Invalid City',
      'GB',
      90.000001,
      0
    )
  $$,
  '23514',
  null,
  'latitude bounds are enforced'
);

select throws_ok(
  $$
    insert into public.cities (
      dataset_version_id, source_city_key, name, country_code, latitude, longitude
    ) values (
      '10000000-0000-0000-0000-000000000001',
      'fixture:invalid-longitude',
      'Invalid City',
      'GB',
      0,
      -180.000001
    )
  $$,
  '23514',
  null,
  'longitude bounds are enforced'
);

insert into auth.users (id, email)
values
  ('30000000-0000-0000-0000-000000000001', 'phase3a-owner@example.invalid'),
  ('30000000-0000-0000-0000-000000000002', 'phase3a-other@example.invalid'),
  ('30000000-0000-0000-0000-000000000003', 'phase3a-suspended@example.invalid'),
  ('30000000-0000-0000-0000-000000000004', 'phase3a-inactive-city@example.invalid');

select is(
  (select count(*)::bigint from private.account_standing where user_id::text like '30000000-%'),
  4::bigint,
  'auth trigger creates account-standing rows'
);

set local role anon;
select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  null,
  'anonymous users cannot read profiles'
);
select throws_ok(
  $$ select * from public.cities $$,
  '42501',
  null,
  'anonymous users cannot read city catalogue'
);
select throws_ok(
  $$ select * from public.raven_types $$,
  '42501',
  null,
  'anonymous users cannot read raven catalogue'
);
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

select results_eq(
  $$
    select username
    from public.create_profile(
      ' Alice ',
      'Alice',
      '20000000-0000-0000-0000-000000000001'
    )
  $$,
  array['alice'::text],
  'profile creation normalizes Username'
);

select results_eq(
  $$ select username from public.profiles $$,
  array['alice'::text],
  'profile owner reads only their own profile'
);

select results_eq(
  $$
    update public.profiles
    set display_name = 'Alice Updated'
    returning display_name
  $$,
  array['Alice Updated'::text],
  'profile owner updates an allowed private field'
);

select throws_ok(
  $$ update public.profiles set username = 'changed' $$,
  '42501',
  null,
  'profile owner cannot mutate Username'
);

select throws_ok(
  $$
    update public.profiles
    set user_id = '30000000-0000-0000-0000-000000000002'
  $$,
  '42501',
  null,
  'profile owner cannot reassign ownership'
);

select throws_ok(
  $$
    insert into public.profiles (user_id, username)
    values ('30000000-0000-0000-0000-000000000002', 'stolen')
  $$,
  '42501',
  null,
  'authenticated users cannot insert profiles directly'
);

select results_eq(
  $$ select name from public.cities order by name $$,
  array['Active City'::text],
  'authenticated users read only active cities'
);

select throws_ok(
  $$
    insert into public.cities (
      dataset_version_id, source_city_key, name, country_code, latitude, longitude
    ) values (
      '10000000-0000-0000-0000-000000000001',
      'fixture:client-write',
      'Client City',
      'GB',
      0,
      0
    )
  $$,
  '42501',
  null,
  'authenticated users cannot modify city catalogue'
);

select is(
  (select count(*)::bigint from public.raven_types),
  5::bigint,
  'authenticated users read all five raven types'
);

select throws_ok(
  $$ update public.raven_types set display_name = 'Changed' where code = 'swift' $$,
  '42501',
  null,
  'authenticated users cannot modify raven catalogue'
);

select throws_ok(
  $$ select * from private.account_standing $$,
  '42501',
  null,
  'authenticated users cannot read account standing'
);

select throws_ok(
  $$ update private.account_standing set standing = 'banned' $$,
  '42501',
  null,
  'authenticated users cannot change account standing'
);

select throws_ok(
  $$ select * from private.reserved_usernames $$,
  '42501',
  null,
  'authenticated users cannot enumerate reserved Usernames'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000002';

select throws_ok(
  $$
    select username
    from public.create_profile(
      'ALICE',
      null,
      '20000000-0000-0000-0000-000000000001'
    )
  $$,
  '23505',
  null,
  'case-insensitive duplicate Username is rejected'
);

select throws_ok(
  $$
    select username
    from public.create_profile(
      ' ADMIN ',
      null,
      '20000000-0000-0000-0000-000000000001'
    )
  $$,
  '22023',
  'username unavailable',
  'reserved Username is rejected after normalization'
);

select throws_ok(
  $$
    select username
    from public.create_profile(
      'bad-name',
      null,
      '20000000-0000-0000-0000-000000000001'
    )
  $$,
  '22023',
  'invalid username',
  'invalid Username syntax is rejected'
);

select throws_ok(
  $$
    select username
    from public.create_profile(
      null,
      null,
      '20000000-0000-0000-0000-000000000001'
    )
  $$,
  '22023',
  'invalid username',
  'NULL Username is rejected consistently'
);

select results_eq(
  $$
    select username
    from public.create_profile(
      'bob',
      'Bob',
      '20000000-0000-0000-0000-000000000001'
    )
  $$,
  array['bob'::text],
  'second user creates their own profile'
);

select is_empty(
  $$ select * from public.profiles where username = 'alice' $$,
  'cross-account profile reads are isolated'
);

select is_empty(
  $$
    update public.profiles
    set display_name = 'Stolen'
    where username = 'alice'
    returning display_name
  $$,
  'cross-account profile updates affect no rows'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';
select results_eq(
  $$ select display_name from public.profiles $$,
  array['Alice Updated'::text],
  'denied cross-account update leaves owner data intact'
);

select throws_ok(
  $$ delete from public.profiles $$,
  '42501',
  null,
  'authenticated users cannot delete their profile directly'
);
reset role;

select throws_ok(
  $$ update public.profiles set username = 'server_changed' where username = 'alice' $$,
  '42501',
  'username is immutable',
  'profile identity trigger blocks privileged Username mutation'
);

select throws_ok(
  $$
    update public.profiles
    set user_id = '30000000-0000-0000-0000-000000000002'
    where username = 'alice'
  $$,
  '42501',
  'profile ownership is immutable',
  'profile identity trigger blocks privileged ownership reassignment'
);

select is(
  (select user_id from public.profiles where username = 'alice'),
  '30000000-0000-0000-0000-000000000001'::uuid,
  'profile ownership remains unchanged'
);

select is(
  (select standing from private.account_standing where user_id = '30000000-0000-0000-0000-000000000001'),
  'active'::text,
  'unauthorized standing writes leave standing unchanged'
);

update private.account_standing
set standing = 'suspended', updated_at = now()
where user_id = '30000000-0000-0000-0000-000000000003';

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000003';
select throws_ok(
  $$
    select username
    from public.create_profile(
      'suspended_user',
      null,
      '20000000-0000-0000-0000-000000000001'
    )
  $$,
  '42501',
  'account unavailable',
  'suspended account cannot create a profile'
);
reset role;

select is(
  (select count(*)::bigint from public.profiles where user_id = '30000000-0000-0000-0000-000000000003'),
  0::bigint,
  'failed suspended-account provisioning creates no profile'
);

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000004';
select throws_ok(
  $$
    select username
    from public.create_profile(
      'inactive_city_user',
      null,
      '20000000-0000-0000-0000-000000000003'
    )
  $$,
  '22023',
  'invalid city',
  'city from an inactive dataset cannot be selected during profile creation'
);
reset role;

select is(
  (select count(*)::bigint from public.profiles where user_id = '30000000-0000-0000-0000-000000000004'),
  0::bigint,
  'failed inactive-city provisioning creates no profile'
);

select * from finish();
rollback;
