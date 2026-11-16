-- Hero badges (New / Rising / Super / Legend) follow the number of DIFFERENT
-- Sunners who sent a person kudos (badge hover: 1–4, 5–9, 10–20, more than 20).
-- Adds sender_distinct_senders / receiver_distinct_senders to kudos_feed
-- (new columns appended, existing ones unchanged).
create or replace view public.kudos_feed with (security_invoker = true) as
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
  exists (select 1 from public.kudo_hearts kh where kh.kudo_id = k.id and kh.user_id = (select auth.uid())) as hearted_by_me,
  (select count(distinct x.sender_id)::int from public.kudos x where x.receiver_id = s.id) as sender_distinct_senders,
  (select count(distinct x.sender_id)::int from public.kudos x where x.receiver_id = r.id) as receiver_distinct_senders
from public.kudos k
join public.profiles s on s.id = k.sender_id
join public.profiles r on r.id = k.receiver_id
left join public.departments sd on sd.id = s.department_id
left join public.departments rd on rd.id = r.department_id;
