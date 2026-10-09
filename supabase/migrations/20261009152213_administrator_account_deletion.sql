create or replace function private.delete_staff_member(target_email text)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if not private.has_role('Administrator') then raise exception 'Administrator access required'; end if;
  if lower(target_email)=lower(auth.jwt()->>'email') then raise exception 'You cannot delete your own staff access'; end if;
  if not exists(select 1 from private.staff_emails where email=lower(target_email)) then raise exception 'Staff record not found'; end if;
  delete from private.staff_emails where email=lower(target_email);
end
$$;

create or replace function public.delete_staff_member(target_email text)
returns void language sql set search_path=''
as $$ select private.delete_staff_member(target_email) $$;

create or replace function private.delete_family_account(target_user uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if not private.has_role('Administrator') then raise exception 'Administrator access required'; end if;
  if target_user=auth.uid() then raise exception 'You cannot delete your own account'; end if;
  if exists(select 1 from private.staff_emails s join auth.users u on lower(u.email)=s.email where u.id=target_user) then raise exception 'Delete staff access from Staff Admin first'; end if;
  if not exists(select 1 from auth.users where id=target_user) then raise exception 'Account not found'; end if;
  if exists(select 1 from storage.objects o join public.applications a on o.name like a.id||'/%' where o.bucket_id='enrollment-documents' and a.owner=target_user::text) then raise exception 'Remove account documents before deleting the account'; end if;

  delete from public.assignments where student_id in (select id from public.students where application_id in (select id from public.applications where owner=target_user::text));
  delete from public.student_progress where student_id in (select id from public.students where application_id in (select id from public.applications where owner=target_user::text));
  delete from public.assignment_library_students where student_id in (select id from public.students where application_id in (select id from public.applications where owner=target_user::text));
  delete from public.students where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.documents where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.messages where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.invoices where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.applications where owner=target_user::text;
  delete from private.account_status where user_id=target_user;
  delete from auth.users where id=target_user;
end
$$;

create or replace function public.delete_family_account(target_user uuid)
returns void language sql set search_path=''
as $$ select private.delete_family_account(target_user) $$;

revoke all on function public.delete_staff_member(text) from public;
revoke all on function public.delete_family_account(uuid) from public;
grant execute on function public.delete_staff_member(text) to authenticated;
grant execute on function public.delete_family_account(uuid) to authenticated;
