-- Run this to grant admin access to a user by email
-- Replace 'admin@maann.in' with the actual email
update public.profiles
set is_admin = true
where id = (
  select id from auth.users where email = 'admin@maann.in'
);
