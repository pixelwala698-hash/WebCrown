# Supabase setup

## 1) Create the tables

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  business_id text,
  business_label_key text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  business_id text,
  business_label_key text,
  pages integer not null default 1,
  selected_features jsonb default '[]'::jsonb,
  selected_languages jsonb default '[]'::jsonb,
  range_low integer not null default 0,
  range_high integer not null default 0,
  delivery_days integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.rates (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
```

## 2) Add Row Level Security

```sql
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.quotes enable row level security;
alter table public.rates enable row level security;
alter table public.projects enable row level security;

create policy "Public can insert leads" on public.leads
for insert with check (true);

create policy "Public can insert quotes" on public.quotes
for insert with check (true);

create policy "Admin can read leads" on public.leads
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy "Admin can update leads" on public.leads
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy "Admin can delete leads" on public.leads
for delete using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy "Admin can view quotes" on public.quotes
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy "Admin can update quotes" on public.quotes
for update using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy "Admin can delete quotes" on public.quotes
for delete using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy "Admin can read rates" on public.rates
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

create policy "Admin can read projects" on public.projects
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);
```

## 3) Create the first admin user

1. In Supabase Dashboard, open Authentication > Users.
2. Add the first admin email/password user.
3. In SQL Editor, insert the matching user into `public.profiles`:

```sql
insert into public.profiles (id, is_admin)
values (
  '00000000-0000-0000-0000-000000000000',
  true
)
on conflict (id) do update set is_admin = true;
```

Replace the UUID above with the actual `auth.users.id` for that admin account.

## 4) Public site settings

Use the public anon key in the browser. Never store the service role key in frontend code.
