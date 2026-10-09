create or replace function private.enforce_family_staff_email_exclusivity()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  target_email text;
begin
  if tg_table_schema='private' and tg_table_name='staff_emails' then
    target_email:=pg_catalog.lower(new.email);
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_email,0));

    -- Existing staff profiles may be updated with an upsert. Only validate new memberships.
    if tg_op='UPDATE' and pg_catalog.lower(old.email)=target_email then return new; end if;
    if tg_op='INSERT' and exists(select 1 from private.staff_emails s where s.email=target_email) then return new; end if;

    if exists(
      select 1
      from public.applications a
      join auth.users u on u.id::text=a.owner
      where pg_catalog.lower(u.email)=target_email
    ) then
      raise exception 'This email already owns a family application. Remove the family data before assigning staff access.' using errcode='23505';
    end if;
  else
    select pg_catalog.lower(u.email) into target_email
    from auth.users u
    where u.id::text=new.owner;

    if target_email is null then return new; end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_email,0));

    if exists(select 1 from private.staff_emails s where s.email=target_email) then
      raise exception 'Staff emails cannot own family applications.' using errcode='23505';
    end if;
  end if;

  return new;
end
$$;

revoke all on function private.enforce_family_staff_email_exclusivity() from public,anon,authenticated;

drop trigger if exists staff_emails_exclude_family_owners on private.staff_emails;
create trigger staff_emails_exclude_family_owners
before insert or update of email on private.staff_emails
for each row execute function private.enforce_family_staff_email_exclusivity();

drop trigger if exists applications_exclude_staff_owners on public.applications;
create trigger applications_exclude_staff_owners
before insert or update of owner on public.applications
for each row execute function private.enforce_family_staff_email_exclusivity();

create or replace function private.admin_accounts()
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if not private.is_staff() or not private.account_active() then raise exception 'Staff access required'; end if;
  return jsonb_build_object(
    'accounts',(
      select coalesce(
        jsonb_agg(jsonb_build_object(
          'id',u.id,
          'email',u.email,
          'confirmed',u.email_confirmed_at is not null,
          'created',u.created_at,
          'last_sign_in',u.last_sign_in_at,
          'suspended',coalesce(s.suspended,false)
        )),
        '[]'::jsonb
      )
      from auth.users u
      left join private.account_status s on s.user_id=u.id
      where not exists(select 1 from private.staff_emails se where se.email=pg_catalog.lower(u.email))
         or exists(select 1 from public.applications a where a.owner=u.id::text)
    ),
    'staff',(select coalesce(jsonb_agg(email),'[]'::jsonb) from private.staff_emails)
  );
end
$$;

create or replace function private.delete_family_account(target_user uuid)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  preserve_staff_access boolean;
begin
  if not private.has_role('Administrator') then raise exception 'Administrator access required'; end if;

  select exists(
    select 1
    from private.staff_emails s
    join auth.users u on pg_catalog.lower(u.email)=s.email
    where u.id=target_user
  ) into preserve_staff_access;

  if not exists(select 1 from auth.users where id=target_user) then raise exception 'Account not found'; end if;
  if target_user=auth.uid() and not preserve_staff_access then raise exception 'You cannot delete your own account'; end if;
  if exists(
    select 1
    from storage.objects o
    join public.applications a on o.name like a.id||'/%'
    where o.bucket_id='enrollment-documents' and a.owner=target_user::text
  ) then raise exception 'Remove account documents before deleting the account'; end if;

  delete from public.assignments where student_id in (select id from public.students where application_id in (select id from public.applications where owner=target_user::text));
  delete from public.student_progress where student_id in (select id from public.students where application_id in (select id from public.applications where owner=target_user::text));
  delete from public.assignment_library_students where student_id in (select id from public.students where application_id in (select id from public.applications where owner=target_user::text));
  delete from public.students where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.documents where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.messages where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.invoices where application_id in (select id from public.applications where owner=target_user::text);
  delete from public.applications where owner=target_user::text;

  if not preserve_staff_access then
    delete from private.account_status where user_id=target_user;
    delete from auth.users where id=target_user;
  end if;
end
$$;
