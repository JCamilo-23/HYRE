create table public.copilot_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  messages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.copilot_sessions enable row level security;

create policy "Users can manage their own copilot sessions"
  on public.copilot_sessions for all
  using (auth.uid() = user_id);

create index copilot_sessions_user_idx on public.copilot_sessions(user_id);
