-- "Viết Kudo" dialog (MoMorph ihQ26W78P2): send a kudos from the board.
-- Adds rich text + anonymous sending to kudos, an RPC that creates a kudos and
-- its hashtags in one transaction, a Sunner search, and the image bucket.

-- ------------------------------------------------------------------ kudos
alter table public.kudos
  add column is_anonymous boolean not null default false,
  -- G: alias shown instead of the sender (required by create_kudo when anonymous).
  add column anonymous_name text check (anonymous_name is null or char_length(anonymous_name) <= 50),
  -- D: rich text as JSON (paragraphs, numbered list, quote; bold / italic /
  -- strike / link / mention). Validated by the app; `content` keeps the plain text.
  add column content_doc jsonb;

-- ------------------------------------------------------- Sunner search (B, @)
create extension if not exists unaccent with schema extensions;

create function public.search_sunners(q text)
returns table (id uuid, full_name text, avatar_url text, department text)
language sql stable security invoker set search_path = '' as $$
  select p.id, p.full_name, p.avatar_url, d.code
  from public.profiles p
  left join public.departments d on d.id = p.department_id
  where p.id <> auth.uid()
    and extensions.unaccent(lower(p.full_name)) like
        '%' || extensions.unaccent(lower(replace(replace(replace(left(coalesce(q, ''), 100), '\', '\\'), '%', '\%'), '_', '\_'))) || '%'
  order by p.full_name
  limit 10
$$;

grant execute on function public.search_sunners(text) to authenticated;

-- ------------------------------------------------------------ create_kudo
-- Runs as the caller (RLS still applies to reads); writes go through this
-- function only, which re-checks every rule from the spec.
create function public.create_kudo(
  p_receiver_id uuid,
  p_title text,
  p_content text,
  p_content_doc jsonb,
  p_hashtags text[],
  p_image_urls text[],
  p_is_anonymous boolean,
  p_anonymous_name text
)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_sender uuid := auth.uid();
  v_title text := btrim(coalesce(p_title, ''));
  v_content text := btrim(coalesce(p_content, ''));
  v_alias text := nullif(btrim(coalesce(p_anonymous_name, '')), '');
  v_tags text[] := array(select distinct t from unnest(coalesce(p_hashtags, '{}')) t);
  v_images text[] := coalesce(p_image_urls, '{}');
  v_id uuid;
begin
  if v_sender is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if p_receiver_id is null or p_receiver_id = v_sender
     or not exists (select 1 from public.profiles where id = p_receiver_id) then
    raise exception 'invalid receiver' using errcode = '22023';
  end if;
  if char_length(v_title) not between 1 and 100 then
    raise exception 'invalid title' using errcode = '22023';
  end if;
  if char_length(v_content) not between 1 and 1000 then
    raise exception 'invalid content' using errcode = '22023';
  end if;
  if cardinality(v_tags) not between 1 and 5
     or (select count(*) from public.hashtags h where h.name = any (v_tags)) <> cardinality(v_tags) then
    raise exception 'invalid hashtags' using errcode = '22023';
  end if;
  -- Images must be files the sender uploaded to their own folder.
  if cardinality(v_images) > 5 or exists (
    select 1 from unnest(v_images) u
    where u !~ ('/storage/v1/object/public/kudo-images/' || v_sender::text || '/[0-9a-f-]{36}\.(png|jpe?g|webp|gif)$')
  ) then
    raise exception 'invalid images' using errcode = '22023';
  end if;
  if coalesce(p_is_anonymous, false) and (v_alias is null or char_length(v_alias) > 50) then
    raise exception 'invalid alias' using errcode = '22023';
  end if;

  insert into public.kudos (sender_id, receiver_id, title, content, content_doc, image_urls, is_anonymous, anonymous_name)
  values (v_sender, p_receiver_id, v_title, v_content, p_content_doc, v_images,
          coalesce(p_is_anonymous, false), case when coalesce(p_is_anonymous, false) then v_alias end)
  returning id into v_id;

  insert into public.kudo_hashtags (kudo_id, hashtag_id)
  select v_id, h.id from public.hashtags h where h.name = any (v_tags);

  return v_id;
end
$$;

revoke execute on function public.create_kudo(uuid, text, text, jsonb, text[], text[], boolean, text) from public, anon;
grant execute on function public.create_kudo(uuid, text, text, jsonb, text[], text[], boolean, text) to authenticated;

-- ------------------------------------------------------------- kudos_feed
-- Same columns as before (anonymous kudos: sender id / avatar / department /
-- badge hidden from everyone but the sender, name = alias), plus
-- content_doc and is_anonymous appended.
create or replace view public.kudos_feed with (security_invoker = true) as
select
  k.id,
  k.title,
  k.content,
  k.image_urls,
  k.created_at,
  case when k.is_anonymous and k.sender_id is distinct from (select auth.uid()) then null else k.sender_id end as sender_id,
  case when k.is_anonymous then k.anonymous_name else s.full_name end as sender_name,
  case when k.is_anonymous then null else s.avatar_url end as sender_avatar_url,
  case when k.is_anonymous then null else sd.code end as sender_department,
  case when k.is_anonymous then 0
       else coalesce((select count(*)::int from public.kudos x where x.receiver_id = s.id), 0) end as sender_received_count,
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
  exists (select 1 from public.kudo_hearts kh where kh.kudo_id = k.id and kh.user_id = (select auth.uid())) as hearted_by_me,
  case when k.is_anonymous then 0
       else (select count(distinct x.sender_id)::int from public.kudos x where x.receiver_id = s.id) end as sender_distinct_senders,
  (select count(distinct x.sender_id)::int from public.kudos x where x.receiver_id = r.id) as receiver_distinct_senders,
  k.content_doc,
  k.is_anonymous
from public.kudos k
join public.profiles s on s.id = k.sender_id
join public.profiles r on r.id = k.receiver_id
left join public.departments sd on sd.id = s.department_id
left join public.departments rd on rd.id = r.department_id;

-- -------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kudo-images', 'kudo-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "users upload kudo images into their folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'kudo-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users delete their kudo images" on storage.objects for delete to authenticated
  using (bucket_id = 'kudo-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
