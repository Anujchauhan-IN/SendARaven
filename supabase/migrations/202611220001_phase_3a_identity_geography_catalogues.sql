begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

-- Supabase grants function execution to PUBLIC by default. New application
-- functions must be explicitly granted instead.
alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;
alter default privileges in schema private revoke execute on functions from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema private revoke all on tables from anon, authenticated;

create function private.normalize_username(input text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select pg_catalog.lower(pg_catalog.btrim(input));
$$;

revoke execute on function private.normalize_username(text) from public, anon, authenticated;
grant execute on function private.normalize_username(text) to service_role;

create table public.city_dataset_versions (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_version text not null,
  licence_name text not null,
  licence_url text,
  imported_at timestamptz not null default now(),
  is_active boolean not null default false,
  constraint city_dataset_versions_source_version_key unique (source_name, source_version),
  constraint city_dataset_versions_source_name_not_blank check (pg_catalog.btrim(source_name) <> ''),
  constraint city_dataset_versions_source_version_not_blank check (pg_catalog.btrim(source_version) <> ''),
  constraint city_dataset_versions_licence_name_not_blank check (pg_catalog.btrim(licence_name) <> '')
);

create unique index city_dataset_versions_one_active_idx
  on public.city_dataset_versions (is_active)
  where is_active;

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  dataset_version_id uuid not null references public.city_dataset_versions(id) on delete restrict,
  source_city_key text not null unique,
  name text not null,
  subdivision text,
  country_code text not null,
  latitude numeric(8, 6) not null,
  longitude numeric(9, 6) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cities_source_city_key_not_blank check (pg_catalog.btrim(source_city_key) <> ''),
  constraint cities_name_not_blank check (pg_catalog.btrim(name) <> ''),
  constraint cities_country_code_format check (country_code ~ '^[A-Z]{2}$'),
  constraint cities_latitude_bounds check (latitude between -90 and 90),
  constraint cities_longitude_bounds check (longitude between -180 and 180)
);

create index cities_manual_search_idx
  on public.cities (pg_catalog.lower(name), country_code)
  where is_active;

create table public.raven_types (
  code text primary key,
  display_name text not null unique,
  speed_kmh numeric(7, 2),
  is_instant boolean not null,
  sort_order smallint not null unique,
  constraint raven_types_code_values check (code in ('phantom', 'swift', 'courier', 'wanderer', 'old')),
  constraint raven_types_speed_consistency check (
    (is_instant and speed_kmh is null)
    or (not is_instant and speed_kmh > 0)
  ),
  constraint raven_types_sort_order_bounds check (sort_order between 1 and 5)
);

insert into public.raven_types (code, display_name, speed_kmh, is_instant, sort_order)
values
  ('phantom', 'Phantom Raven', null, true, 1),
  ('swift', 'Swift Raven', 500, false, 2),
  ('courier', 'Courier Raven', 250, false, 3),
  ('wanderer', 'Wanderer Raven', 100, false, 4),
  ('old', 'Old Raven', 50, false, 5);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  city_id uuid references public.cities(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_username_normalized check (username = private.normalize_username(username))
);

create table private.account_standing (
  user_id uuid primary key references auth.users(id) on delete cascade,
  standing text not null default 'active',
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_standing_value check (standing in ('active', 'suspended', 'banned', 'deleted'))
);

create table private.reserved_usernames (
  username text primary key,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint reserved_usernames_format check (username ~ '^[a-z0-9_]{3,24}$'),
  constraint reserved_usernames_normalized check (username = private.normalize_username(username)),
  constraint reserved_usernames_reason_not_blank check (pg_catalog.btrim(reason) <> '')
);

-- Minimum security-critical namespaces. The public-launch registry can only
-- expand this set before Phase 4 registration is enabled.
insert into private.reserved_usernames (username, reason)
values
  ('admin', 'Administration namespace'),
  ('administrator', 'Administration namespace'),
  ('support', 'Support namespace'),
  ('security', 'Security namespace'),
  ('system', 'System namespace'),
  ('service', 'Service namespace'),
  ('sendaraven', 'Product namespace'),
  ('postgres', 'Database role namespace'),
  ('supabase', 'Platform namespace'),
  ('anon', 'Database role namespace'),
  ('authenticated', 'Database role namespace'),
  ('service_role', 'Database role namespace');

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into private.account_standing (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function private.handle_new_auth_user() from public, anon, authenticated;
grant execute on function private.handle_new_auth_user() to service_role;

create trigger on_auth_user_created_create_account_standing
after insert on auth.users
for each row execute function private.handle_new_auth_user();

insert into private.account_standing (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create function private.protect_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception using errcode = '42501', message = 'profile ownership is immutable';
  end if;

  if new.username is distinct from old.username then
    raise exception using errcode = '42501', message = 'username is immutable';
  end if;

  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke execute on function private.protect_profile_identity() from public, anon, authenticated;
grant execute on function private.protect_profile_identity() to service_role;

create trigger protect_profile_identity_before_update
before update on public.profiles
for each row execute function private.protect_profile_identity();

create function private.reject_raven_type_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = '42501', message = 'raven catalogue is immutable';
end;
$$;

revoke execute on function private.reject_raven_type_mutation() from public, anon, authenticated;
grant execute on function private.reject_raven_type_mutation() to service_role;

create trigger raven_types_are_immutable
before insert or update or delete or truncate on public.raven_types
for each statement execute function private.reject_raven_type_mutation();

create function public.create_profile(
  p_username text,
  p_display_name text default null,
  p_city_id uuid default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  normalized_username text := private.normalize_username(p_username);
  created_profile public.profiles;
begin
  if caller_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  if normalized_username is null or normalized_username !~ '^[a-z0-9_]{3,24}$' then
    raise exception using errcode = '22023', message = 'invalid username';
  end if;

  if exists (
    select 1
    from private.reserved_usernames
    where username = normalized_username
  ) then
    raise exception using errcode = '22023', message = 'username unavailable';
  end if;

  if not exists (
    select 1
    from private.account_standing
    where user_id = caller_id
      and standing = 'active'
  ) then
    raise exception using errcode = '42501', message = 'account unavailable';
  end if;

  if p_city_id is not null and not exists (
    select 1
    from public.cities
    join public.city_dataset_versions
      on city_dataset_versions.id = cities.dataset_version_id
    where cities.id = p_city_id
      and cities.is_active
      and city_dataset_versions.is_active
  ) then
    raise exception using errcode = '22023', message = 'invalid city';
  end if;

  insert into public.profiles (user_id, username, display_name, city_id)
  values (caller_id, normalized_username, p_display_name, p_city_id)
  returning * into created_profile;

  return created_profile;
end;
$$;

revoke execute on function public.create_profile(text, text, uuid) from public, anon, authenticated;
grant execute on function public.create_profile(text, text, uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.city_dataset_versions enable row level security;
alter table public.city_dataset_versions force row level security;
alter table public.cities enable row level security;
alter table public.cities force row level security;
alter table public.raven_types enable row level security;
alter table public.raven_types force row level security;
alter table private.account_standing enable row level security;
alter table private.account_standing force row level security;
alter table private.reserved_usernames enable row level security;
alter table private.reserved_usernames force row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.city_dataset_versions from anon, authenticated;
revoke all on table public.cities from anon, authenticated;
revoke all on table public.raven_types from anon, authenticated;
revoke all on table private.account_standing from anon, authenticated;
revoke all on table private.reserved_usernames from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, city_id) on table public.profiles to authenticated;
grant select on table public.city_dataset_versions to authenticated;
grant select on table public.cities to authenticated;
grant select on table public.raven_types to authenticated;

grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.city_dataset_versions to service_role;
grant select, insert, update, delete on table public.cities to service_role;
grant select on table public.raven_types to service_role;
grant select, insert, update, delete on table private.account_standing to service_role;
grant select, insert, update, delete on table private.reserved_usernames to service_role;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    city_id is null
    or exists (
      select 1
      from public.cities
      join public.city_dataset_versions
        on city_dataset_versions.id = cities.dataset_version_id
      where cities.id = profiles.city_id
        and cities.is_active
        and city_dataset_versions.is_active
    )
  )
);

create policy city_dataset_versions_read_authenticated
on public.city_dataset_versions
for select
to authenticated
using (true);

create policy cities_read_authenticated
on public.cities
for select
to authenticated
using (
  is_active
  and exists (
    select 1
    from public.city_dataset_versions
    where city_dataset_versions.id = cities.dataset_version_id
      and city_dataset_versions.is_active
  )
);

create policy raven_types_read_authenticated
on public.raven_types
for select
to authenticated
using (true);

comment on table public.profiles is 'Private account profile keyed by the immutable Supabase Auth UUID.';
comment on table private.account_standing is 'Server-controlled account eligibility; never exposed through the Data API.';
comment on table private.reserved_usernames is 'Server-maintained normalized Username reservation registry.';
comment on table public.city_dataset_versions is 'Licensed city dataset provenance and version metadata.';
comment on table public.cities is 'Server-controlled city catalogue with stable IDs, validated centroids and current dataset-version provenance; imports update stable rows rather than exposing historical mission geography.';
comment on table public.raven_types is 'Immutable approved five-raven type and speed catalogue.';
comment on function public.create_profile(text, text, uuid) is 'Creates the authenticated caller profile with normalized immutable Username validation.';

commit;
