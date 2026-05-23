create type simulation_status as enum ('pending', 'in_progress', 'completed', 'failed');

create table public.simulations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade not null,
  candidate_id uuid references public.profiles(id) on delete cascade not null,
  status simulation_status not null default 'pending',
  score integer check (score >= 0 and score <= 100),
  video_url text,
  analysis jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.simulations enable row level security;

create policy "Candidates can view their own simulations"
  on public.simulations for select
  using (auth.uid() = candidate_id);

create policy "Candidates can create simulations"
  on public.simulations for insert
  with check (auth.uid() = candidate_id);

create policy "Candidates can update their own simulations"
  on public.simulations for update
  using (auth.uid() = candidate_id);

create policy "Recruiters can view simulations for their jobs"
  on public.simulations for select
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = simulations.job_id
      and jobs.company_id = auth.uid()
    )
  );

create index simulations_candidate_idx on public.simulations(candidate_id);
create index simulations_job_idx on public.simulations(job_id);
