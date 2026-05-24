-- Persist role and profile fields from OAuth metadata on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  parsed_role user_role;
begin
  begin
    parsed_role := coalesce(
      (new.raw_user_meta_data->>'role')::user_role,
      'candidate'::user_role
    );
  exception when others then
    parsed_role := 'candidate';
  end;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url',
    parsed_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = coalesce(excluded.role, public.profiles.role),
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

-- Allow users to insert their own profile during OAuth callback fallback
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
