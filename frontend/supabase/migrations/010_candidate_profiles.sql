create table public.candidate_profiles (
  id            uuid references public.profiles(id) on delete cascade primary key,
  birth_year    int,
  city          text,
  career_stage  text check (career_stage in ('estudiante', 'recien_graduado', 'con_experiencia')),
  skills        text[]      not null default '{}',
  cv_url        text,
  linkedin_url  text,
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;

create policy "Candidato ve su propio perfil"
  on public.candidate_profiles for select
  using (auth.uid() = id);

create policy "Candidato actualiza su propio perfil"
  on public.candidate_profiles for update
  using (auth.uid() = id);

-- Negocios pueden ver candidatos (para matching)
create policy "Negocios pueden ver candidatos"
  on public.candidate_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'business'
    )
  );

-- Auto-crear fila cuando se registra un candidato
create or replace function public.handle_new_candidate()
returns trigger as $$
begin
  if new.role = 'candidate' then
    insert into public.candidate_profiles (id) values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_candidate_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_candidate();
