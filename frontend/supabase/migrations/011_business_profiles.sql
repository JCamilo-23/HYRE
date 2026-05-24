create table public.business_profiles (
  id            uuid references public.profiles(id) on delete cascade primary key,
  company_name  text        not null default '',
  industry      text,
  company_size  text check (company_size in ('1-10', '11-50', '51-200', '200+')),
  city          text,
  website_url   text,
  nit           text,
  description   text,
  logo_url      text,
  verified      boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "Negocio ve su propio perfil"
  on public.business_profiles for select
  using (auth.uid() = id);

create policy "Negocio actualiza su propio perfil"
  on public.business_profiles for update
  using (auth.uid() = id);

-- Candidatos pueden ver perfiles públicos de negocios
create policy "Candidatos pueden ver negocios"
  on public.business_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'candidate'
    )
  );

-- Auto-crear fila cuando se registra un negocio
create or replace function public.handle_new_business()
returns trigger as $$
begin
  if new.role = 'business' then
    insert into public.business_profiles (id, company_name)
    values (new.id, coalesce(new.full_name, ''));
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_business_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_business();
