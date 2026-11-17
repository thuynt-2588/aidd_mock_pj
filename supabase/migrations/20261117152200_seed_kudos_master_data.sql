-- Production master data required by the Write Kudos form.
insert into public.departments (code)
values ('CEVC1'), ('CEVC2'), ('CEVC10'), ('BDC'), ('HRD'), ('SPD')
on conflict (code) do nothing;

insert into public.hashtags (name)
values ('#Dedicated'), ('#Inspiring'), ('#Teamwork'), ('#Creative'),
       ('#Supportive'), ('#ProblemSolver'), ('#Leadership')
on conflict (name) do nothing;

-- Update the master profile if its Google account already exists. Do not
-- create an auth user here: the user must sign in through Google first.
do $$
begin
  if exists (
    select 1 from auth.users
    where lower(email) = 'nguyen.thi.thuy-d@sun-asterisk.com'
  ) then
    insert into public.profiles (id, full_name, avatar_url, department_id)
    select u.id, 'Nguyễn Thị Thúy D', u.raw_user_meta_data ->> 'avatar_url', d.id
    from auth.users u
    join public.departments d on d.code = 'CEVC2'
    where lower(u.email) = 'nguyen.thi.thuy-d@sun-asterisk.com'
    on conflict (id) do update
      set full_name = excluded.full_name,
          department_id = excluded.department_id;
  else
    raise notice 'nguyen.thi.thuy-d@sun-asterisk.com is not registered yet; have the user sign in with Google once to create the recipient profile.';
  end if;
end
$$;
