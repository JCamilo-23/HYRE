-- Agregar 'business' al enum de roles (recruiter se mantiene por compatibilidad)
alter type user_role add value if not exists 'business';

-- Reparar el trigger: ahora sí guarda el rol desde raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(
      (new.raw_user_meta_data->>'role')::user_role,
      'candidate'
    )
  );
  return new;
end;
$$ language plpgsql security definer;
