create extension if not exists pgcrypto;

create type public.organisation_role as enum (
  'owner',
  'admin',
  'project_manager',
  'contributor',
  'viewer'
);

create type public.workstream_status as enum ('Green', 'Yellow', 'Red');
create type public.risk_severity as enum ('Low', 'Medium', 'High');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_members (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organisation_role not null default 'viewer',
  joined_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);

create table public.workstreams (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  owner_name text not null,
  milestone text not null,
  risks text not null default '',
  status public.workstream_status not null default 'Green',
  severity public.risk_severity not null default 'Low',
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organisation_members_user_idx
  on public.organisation_members(user_id);
create index workstreams_organisation_idx
  on public.workstreams(organisation_id);
create index workstreams_status_idx
  on public.workstreams(organisation_id, status);

create or replace function public.is_organisation_member(target_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members
    where organisation_id = target_organisation_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_organisation_role(
  target_organisation_id uuid,
  allowed_roles public.organisation_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members
    where organisation_id = target_organisation_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organisation_id uuid;
  organisation_name text;
  organisation_slug text;
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  organisation_name := nullif(trim(new.raw_user_meta_data ->> 'organisation_name'), '');
  if organisation_name is not null then
    organisation_slug := lower(regexp_replace(organisation_name, '[^a-zA-Z0-9]+', '-', 'g'));
    organisation_slug := trim(both '-' from organisation_slug) || '-' || left(replace(new.id::text, '-', ''), 6);

    insert into public.organisations (name, slug, created_by)
    values (organisation_name, organisation_slug, new.id)
    returning id into new_organisation_id;

    insert into public.organisation_members (organisation_id, user_id, role)
    values (new_organisation_id, new.id, 'owner');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.workstreams enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Members can view their organisations"
  on public.organisations for select to authenticated
  using (public.is_organisation_member(id));

create policy "Organisation managers can update organisations"
  on public.organisations for update to authenticated
  using (public.has_organisation_role(id, array['owner', 'admin']::public.organisation_role[]))
  with check (public.has_organisation_role(id, array['owner', 'admin']::public.organisation_role[]));

create policy "Members can view organisation membership"
  on public.organisation_members for select to authenticated
  using (public.is_organisation_member(organisation_id));

create policy "Organisation managers can add members"
  on public.organisation_members for insert to authenticated
  with check (public.has_organisation_role(organisation_id, array['owner', 'admin']::public.organisation_role[]));

create policy "Organisation managers can update members"
  on public.organisation_members for update to authenticated
  using (public.has_organisation_role(organisation_id, array['owner', 'admin']::public.organisation_role[]))
  with check (public.has_organisation_role(organisation_id, array['owner', 'admin']::public.organisation_role[]));

create policy "Organisation managers can remove members"
  on public.organisation_members for delete to authenticated
  using (public.has_organisation_role(organisation_id, array['owner', 'admin']::public.organisation_role[]));

create policy "Members can view workstreams"
  on public.workstreams for select to authenticated
  using (public.is_organisation_member(organisation_id));

create policy "Contributors can create workstreams"
  on public.workstreams for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and public.has_organisation_role(
      organisation_id,
      array['owner', 'admin', 'project_manager', 'contributor']::public.organisation_role[]
    )
  );

create policy "Contributors can update workstreams"
  on public.workstreams for update to authenticated
  using (
    public.has_organisation_role(
      organisation_id,
      array['owner', 'admin', 'project_manager', 'contributor']::public.organisation_role[]
    )
  )
  with check (
    public.has_organisation_role(
      organisation_id,
      array['owner', 'admin', 'project_manager', 'contributor']::public.organisation_role[]
    )
  );

create policy "Managers can delete workstreams"
  on public.workstreams for delete to authenticated
  using (
    public.has_organisation_role(
      organisation_id,
      array['owner', 'admin', 'project_manager']::public.organisation_role[]
    )
  );
