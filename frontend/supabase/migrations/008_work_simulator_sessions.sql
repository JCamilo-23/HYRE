create table public.work_simulator_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete set null,
  role_title text not null,
  company_name text not null default 'Empresa',
  scenario_context jsonb not null default '{}',
  messages jsonb not null default '[]',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_simulator_sessions enable row level security;

create policy "Users manage own work simulator sessions"
  on public.work_simulator_sessions for all
  using (auth.uid() = user_id);

create index work_simulator_sessions_user_idx on public.work_simulator_sessions(user_id);
create index work_simulator_sessions_job_idx on public.work_simulator_sessions(job_id);

create or replace function public.set_work_simulator_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger work_simulator_sessions_updated_at
  before update on public.work_simulator_sessions
  for each row execute function public.set_work_simulator_updated_at();
