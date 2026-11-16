-- Local sample data for Sun* Kudos (MaZUn5xHXZ). Idempotent: safe to re-run.
-- Sunner accounts are auth users without a password (they cannot sign in);
-- profiles come from the on_auth_user_created trigger.

insert into public.departments (code)
values ('CEVC1'), ('CEVC2'), ('CEVC10'), ('BDC'), ('HRD'), ('SPD')
on conflict (code) do nothing;

insert into public.hashtags (name)
values ('#Dedicated'), ('#Inspiring'), ('#Teamwork'), ('#Creative'), ('#Supportive'), ('#ProblemSolver'), ('#Leadership')
on conflict (name) do nothing;

insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000', s.id, 'authenticated', 'authenticated', s.email,
       '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', s.name), now(), now()
from (values
  ('5a000000-0000-4000-8000-000000000001'::uuid, 'huynh.duong.xuan@seed.sun-kudos.test', 'Huỳnh Dương Xuân'),
  ('5a000000-0000-4000-8000-000000000002'::uuid, 'do.hoang.hiep@seed.sun-kudos.test', 'Đỗ Hoàng Hiệp'),
  ('5a000000-0000-4000-8000-000000000003'::uuid, 'duong.thuy.an@seed.sun-kudos.test', 'Dương Thúy An'),
  ('5a000000-0000-4000-8000-000000000004'::uuid, 'mai.phuong.thuy@seed.sun-kudos.test', 'Mai Phương Thúy'),
  ('5a000000-0000-4000-8000-000000000005'::uuid, 'le.kieu.trang@seed.sun-kudos.test', 'Lê Kiều Trang'),
  ('5a000000-0000-4000-8000-000000000006'::uuid, 'nguyen.van.quy@seed.sun-kudos.test', 'Nguyễn Văn Quy'),
  ('5a000000-0000-4000-8000-000000000007'::uuid, 'nguyen.ba.chuc@seed.sun-kudos.test', 'Nguyễn Bá Chức'),
  ('5a000000-0000-4000-8000-000000000008'::uuid, 'nguyen.hoang.linh@seed.sun-kudos.test', 'Nguyễn Hoàng Linh')
) as s (id, email, name)
on conflict (id) do nothing;

update public.profiles p
set department_id = d.id
from (values
  ('5a000000-0000-4000-8000-000000000001'::uuid, 'CEVC10'),
  ('5a000000-0000-4000-8000-000000000002'::uuid, 'CEVC1'),
  ('5a000000-0000-4000-8000-000000000003'::uuid, 'CEVC2'),
  ('5a000000-0000-4000-8000-000000000004'::uuid, 'BDC'),
  ('5a000000-0000-4000-8000-000000000005'::uuid, 'HRD'),
  ('5a000000-0000-4000-8000-000000000006'::uuid, 'CEVC10'),
  ('5a000000-0000-4000-8000-000000000007'::uuid, 'SPD'),
  ('5a000000-0000-4000-8000-000000000008'::uuid, 'CEVC1')
) as m (profile_id, code)
join public.departments d on d.code = m.code
where p.id = m.profile_id;

-- 30 kudos, one every 7 hours back from 2025-11-10 18:00 (UTC+7). Sender and
-- receiver rotate through the 8 seed Sunners; receiver n+3 gets the most.
insert into public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
select
  ('5b000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  ('5a000000-0000-4000-8000-' || lpad((1 + (i % 8))::text, 12, '0'))::uuid,
  ('5a000000-0000-4000-8000-' || lpad((1 + ((i + 1 + (i % 3)) % 8))::text, 12, '0'))::uuid,
  (array['IDOL GIỚI TRẺ', 'NGƯỜI TRUYỀN LỬA', 'CHIẾN BINH DEADLINE', 'BẠN ĐỒNG HÀNH TẬN TÂM'])[1 + (i % 4)],
  (array[
    'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. Chúc em luôn giữ được ngọn lửa nhiệt huyết này nhé!',
    'Cảm ơn anh đã luôn kiên nhẫn review code và chia sẻ kinh nghiệm cho cả team.',
    'Sprint vừa rồi không có em chắc team không kịp release. Cảm ơn em đã ở lại cùng mọi người tới phút cuối, luôn vui vẻ và lan toả năng lượng tích cực. Chúc em sức khoẻ và luôn giữ nụ cười như thế!',
    'Cảm ơn chị đã tổ chức buổi workshop thật bổ ích, mọi người đều học được rất nhiều điều mới.'
  ])[1 + (i % 4)],
  case when i % 5 = 0 then array['/home/award-top-talent.png', '/home/award-mvp.png', '/home/award-best-manager.png']
       when i % 5 = 2 then array['/home/award-top-project.png']
       else '{}' end,
  timestamptz '2025-11-10 18:00:00+07' - make_interval(hours => 7 * i)
from generate_series(1, 30) as i
on conflict (id) do nothing;

insert into public.kudo_hashtags (kudo_id, hashtag_id)
select k.id, h.id
from public.kudos k
join lateral (
  select h.id from public.hashtags h
  order by (h.id + ('x' || substr(k.id::text, 35, 2))::bit(8)::int) % 7
  limit 1 + (('x' || substr(k.id::text, 35, 2))::bit(8)::int % 4)
) h on true
where k.id::text like '5b000000-%'
on conflict do nothing;

-- Hearts: kudos i gets (i * 7) % 8 hearts from Sunners other than its sender.
insert into public.kudo_hearts (kudo_id, user_id)
select k.id, p.id
from public.kudos k
join public.profiles p on p.id <> k.sender_id and p.id::text like '5a000000-%'
where k.id::text like '5b000000-%'
  and (('x' || substr(p.id::text, 35, 2))::bit(8)::int) <= ((('x' || substr(k.id::text, 35, 2))::bit(8)::int * 7) % 8)
on conflict do nothing;

-- Secret boxes: 7 opened with a gift (D.3) and a few unopened.
insert into public.secret_boxes (id, owner_id, gift, opened_at)
select
  ('5c000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  ('5a000000-0000-4000-8000-' || lpad((1 + (i % 8))::text, 12, '0'))::uuid,
  case when i <= 7 then (array['Nhận được 1 áo phông SAA', 'Nhận được 1 bình giữ nhiệt', 'Nhận được 1 voucher 200K', 'Nhận được 1 sổ tay SAA'])[1 + (i % 4)] end,
  case when i <= 7 then timestamptz '2025-11-10 20:00:00+07' - make_interval(hours => 5 * i) end
from generate_series(1, 10) as i
on conflict (id) do nothing;

-- Extra kudos so Nguyễn Văn Quy and Nguyễn Hoàng Linh receive many kudos
-- (highlight / spotlight sizes). Older than the batch above.
insert into public.kudos (id, sender_id, receiver_id, title, content, created_at)
select
  ('5b000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  ('5a000000-0000-4000-8000-' || lpad((1 + (i % 5))::text, 12, '0'))::uuid,
  case when i <= 50 then '5a000000-0000-4000-8000-000000000006'::uuid else '5a000000-0000-4000-8000-000000000008'::uuid end,
  'NGƯỜI TRUYỀN LỬA',
  'Cảm ơn vì luôn sẵn sàng hỗ trợ mọi người, dù việc lớn hay nhỏ.',
  timestamptz '2025-11-01 09:00:00+07' - make_interval(hours => 3 * i)
from generate_series(31, 60) as i
on conflict (id) do nothing;

insert into public.kudo_hashtags (kudo_id, hashtag_id)
select k.id, h.id from public.kudos k join public.hashtags h on h.name = '#Supportive'
where k.id::text like '5b000000-%' and k.created_at < timestamptz '2025-11-01 09:00:01+07'
on conflict do nothing;

-- Hero badge tiers follow the number of DIFFERENT senders (1–4 New, 5–9 Rising,
-- 10–20 Super, >20 Legend). 20 extra "fan" Sunners (Sunner Fan 01–20) send old
-- kudos so every tier shows up: Nguyễn Văn Quy 25 senders (Legend), Nguyễn
-- Hoàng Linh 15 (Super), Huỳnh Dương Xuân 6 (Rising), the others 3 (New).
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000',
       ('5a000000-0000-4000-8000-' || lpad((100 + n)::text, 12, '0'))::uuid,
       'authenticated', 'authenticated', 'sunner.fan.' || lpad(n::text, 2, '0') || '@seed.sun-kudos.test',
       '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', 'Sunner Fan ' || lpad(n::text, 2, '0')), now(), now()
from generate_series(1, 20) as n
on conflict (id) do nothing;

update public.profiles p
set department_id = d.id
from public.departments d
where d.code = 'SPD' and p.id::text like '5a000000-0000-4000-8000-0000000001%' and p.department_id is null;

insert into public.kudos (id, sender_id, receiver_id, title, content, created_at)
select
  ('5c000000-0000-4000-8000-' || lpad((r.slot * 100 + n)::text, 12, '0'))::uuid,
  ('5a000000-0000-4000-8000-' || lpad((100 + n)::text, 12, '0'))::uuid,
  r.receiver_id,
  'BẠN ĐỒNG HÀNH TẬN TÂM',
  'Cảm ơn bạn đã luôn tận tình giúp đỡ mỗi khi mình cần.',
  timestamptz '2025-10-01 09:00:00+07' - make_interval(hours => r.slot * 100 + n)
from (values
  (1, '5a000000-0000-4000-8000-000000000006'::uuid, 20),
  (2, '5a000000-0000-4000-8000-000000000008'::uuid, 8),
  (3, '5a000000-0000-4000-8000-000000000001'::uuid, 3)
) as r (slot, receiver_id, fans)
cross join generate_series(1, 20) as n
where n <= r.fans
on conflict (id) do nothing;
