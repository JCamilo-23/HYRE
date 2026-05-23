create type job_status as enum ('active', 'paused', 'closed');

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  requirements text[] not null default '{}',
  salary_min integer,
  salary_max integer,
  location text,
  remote boolean not null default false,
  status job_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Anyone can view active jobs"
  on public.jobs for select
  using (status = 'active');

create policy "Recruiters can manage their own jobs"
  on public.jobs for all
  using (auth.uid() = company_id);

create index jobs_company_id_idx on public.jobs(company_id);
create index jobs_status_idx on public.jobs(status);
