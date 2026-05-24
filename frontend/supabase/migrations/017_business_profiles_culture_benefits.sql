alter table public.business_profiles
  add column if not exists culture text[] not null default '{}',
  add column if not exists benefits text[] not null default '{}';
