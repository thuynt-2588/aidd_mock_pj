-- Sun* Kudos - Live board (MoMorph MaZUn5xHXZ).
-- Kudos (thank-you notes) between Sunners, hashtags, hearts, secret boxes.

-- ---------------------------------------------------------------- profiles
create table public.departments (
  id smallint generated always as identity primary key,
  code text not null unique
);

-- One row per auth user (name + Gmail avatar), created by a trigger.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  avatar_url text,
  department_id smallint references public.departments (id),
  created_at timestamptz not null default now()
);

create function public.profile_name_from(meta jsonb, email text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(nullif(meta ->> 'full_name', ''), nullif(meta ->> 'name', ''), split_part(email, '@', 1))
$$;

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, public.profile_name_from(new.raw_user_meta_data, new.email), new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users who signed up before this migration.
insert into public.profiles (id, full_name, avatar_url)
select u.id, public.profile_name_from(u.raw_user_meta_data, u.email), u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;

-- ------------------------------------------------------------------- kudos
create table public.hashtags (
  id smallint generated always as identity primary key,
  name text not null unique
);

create table public.kudos (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  -- Award-style title shown above the message, e.g. "IDOL GIỚI TRẺ".
  title text not null,
  content text not null,
  -- C.3.6: up to 5 attached images.
  image_urls text[] not null default '{}' check (cardinality(image_urls) <= 5),
  created_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);
create index kudos_created_at_idx on public.kudos (created_at desc, id desc);
create index kudos_receiver_idx on public.kudos (receiver_id);
create index kudos_sender_idx on public.kudos (sender_id);

create table public.kudo_hashtags (
  kudo_id uuid not null references public.kudos (id) on delete cascade,
  hashtag_id smallint not null references public.hashtags (id) on delete cascade,
  primary key (kudo_id, hashtag_id)
);

-- ------------------------------------------------------------------ hearts
-- C.4.1: days configured by an admin on which a heart counts double.
create table public.special_days (day date primary key);

-- One heart per user per kudos. `weight` (1, or 2 on a special day) is kept so
-- that removing the heart takes back exactly what was granted.
create table public.kudo_hearts (
  kudo_id uuid not null references public.kudos (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  weight smallint not null default 1 check (weight in (1, 2)),
  created_at timestamptz not null default now(),
  primary key (kudo_id, user_id)
);
create index kudo_hearts_user_idx on public.kudo_hearts (user_id);

create function public.kudo_hearts_before_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- The sender cannot heart their own kudos.
  if exists (select 1 from public.kudos k where k.id = new.kudo_id and k.sender_id = new.user_id) then
    raise exception 'cannot heart your own kudos' using errcode = '42501';
  end if;
  -- Weight is decided by the server clock (Vietnam date), never by the client.
  new.created_at := now();
  new.weight := case
    when exists (select 1 from public.special_days d where d.day = (now() at time zone 'Asia/Ho_Chi_Minh')::date) then 2
    else 1
  end;
  return new;
end
$$;

create trigger kudo_hearts_before_insert
  before insert on public.kudo_hearts
  for each row execute function public.kudo_hearts_before_insert();

-- ------------------------------------------------------------ secret boxes
create table public.secret_boxes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  gift text,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);
create index secret_boxes_opened_idx on public.secret_boxes (opened_at desc) where opened_at is not null;

-- --------------------------------------------------------------------- RLS
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.hashtags enable row level security;
alter table public.kudos enable row level security;
alter table public.kudo_hashtags enable row level security;
alter table public.special_days enable row level security;
alter table public.kudo_hearts enable row level security;
alter table public.secret_boxes enable row level security;

create policy "signed-in users read departments" on public.departments for select to authenticated using (true);
create policy "signed-in users read profiles" on public.profiles for select to authenticated using (true);
create policy "signed-in users read hashtags" on public.hashtags for select to authenticated using (true);
create policy "signed-in users read kudos" on public.kudos for select to authenticated using (true);
create policy "signed-in users read kudo hashtags" on public.kudo_hashtags for select to authenticated using (true);
create policy "signed-in users read special days" on public.special_days for select to authenticated using (true);
create policy "signed-in users read hearts" on public.kudo_hearts for select to authenticated using (true);
create policy "users add their own heart" on public.kudo_hearts for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "users remove their own heart" on public.kudo_hearts for delete to authenticated
  using (user_id = (select auth.uid()));
create policy "signed-in users read secret boxes" on public.secret_boxes for select to authenticated using (true);

-- ------------------------------------------------------------- read views
-- Kudos received per Sunner (stars / hero badge, Spotlight word cloud).
create view public.kudos_receiver_stats with (security_invoker = true) as
select
  p.id as profile_id,
  p.full_name,
  count(k.id)::int as kudos_count,
  max(k.created_at) as last_received_at,
  -- B.7: clicking a name opens the latest kudos that person received.
  (array_agg(k.id order by k.created_at desc))[1] as latest_kudo_id
from public.profiles p
join public.kudos k on k.receiver_id = p.id
group by p.id, p.full_name;

-- Everything a kudos card needs, one row per kudos.
create view public.kudos_feed with (security_invoker = true) as
select
  k.id,
  k.title,
  k.content,
  k.image_urls,
  k.created_at,
  k.sender_id,
  s.full_name as sender_name,
  s.avatar_url as sender_avatar_url,
  sd.code as sender_department,
  coalesce((select count(*)::int from public.kudos x where x.receiver_id = s.id), 0) as sender_received_count,
  k.receiver_id,
  r.full_name as receiver_name,
  r.avatar_url as receiver_avatar_url,
  rd.code as receiver_department,
  coalesce((select count(*)::int from public.kudos x where x.receiver_id = r.id), 0) as receiver_received_count,
  coalesce(
    (select array_agg(h.name order by h.name) from public.kudo_hashtags kh join public.hashtags h on h.id = kh.hashtag_id where kh.kudo_id = k.id),
    '{}'
  ) as hashtags,
  (select count(*)::int from public.kudo_hearts kh where kh.kudo_id = k.id) as heart_count,
  exists (select 1 from public.kudo_hearts kh where kh.kudo_id = k.id and kh.user_id = (select auth.uid())) as hearted_by_me
from public.kudos k
join public.profiles s on s.id = k.sender_id
join public.profiles r on r.id = k.receiver_id
left join public.departments sd on sd.id = s.department_id
left join public.departments rd on rd.id = r.department_id;

-- D.3: latest opened secret boxes with a gift.
create view public.recent_gift_recipients with (security_invoker = true) as
select b.id, b.gift, b.opened_at, p.id as profile_id, p.full_name, p.avatar_url
from public.secret_boxes b
join public.profiles p on p.id = b.owner_id
where b.opened_at is not null and b.gift is not null;

-- D.1: the signed-in user's own numbers.
create function public.my_kudos_stats()
returns table (
  kudos_received int,
  kudos_sent int,
  hearts_received int,
  boxes_opened int,
  boxes_unopened int
)
language sql stable security invoker set search_path = '' as $$
  select
    (select count(*)::int from public.kudos where receiver_id = auth.uid()),
    (select count(*)::int from public.kudos where sender_id = auth.uid()),
    -- C.4.1: hearts on kudos you SENT count for you (x2 on special days).
    (select coalesce(sum(h.weight), 0)::int from public.kudo_hearts h join public.kudos k on k.id = h.kudo_id where k.sender_id = auth.uid()),
    (select count(*)::int from public.secret_boxes where owner_id = auth.uid() and opened_at is not null),
    (select count(*)::int from public.secret_boxes where owner_id = auth.uid() and opened_at is null)
$$;

grant execute on function public.my_kudos_stats() to authenticated;
