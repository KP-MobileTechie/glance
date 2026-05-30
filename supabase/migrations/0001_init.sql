-- Glance cloud schema

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  github_handle text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users (id) on delete set null,
  name text not null,
  theme jsonb not null,
  is_public boolean not null default true,
  use_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table user_state enable row level security;
alter table themes enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own state" on user_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "public themes are readable" on themes
  for select using (is_public = true);

create policy "authors manage their themes" on themes
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create or replace function increment_theme_use(theme_id uuid)
returns void language sql as $$
  update themes set use_count = use_count + 1 where id = theme_id;
$$;
