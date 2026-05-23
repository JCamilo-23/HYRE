create type subscription_plan as enum ('free', 'pro', 'enterprise');
create type subscription_status as enum ('active', 'canceled', 'past_due');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan subscription_plan not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status subscription_status not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create function public.handle_new_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_add_subscription
  after insert on public.profiles
  for each row execute procedure public.handle_new_subscription();
