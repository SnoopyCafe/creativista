alter table private.staff_emails drop constraint staff_emails_role_check;
alter table private.staff_emails add constraint staff_emails_role_check check(role=any(array['Administrator','Dashboard','Accounts','Applications','Assignments','Invoices','Students']));
alter table private.staff_emails drop constraint valid_staff_roles;
alter table private.staff_emails add constraint valid_staff_roles check(roles <@ array['Administrator','Dashboard','Accounts','Applications','Assignments','Invoices','Students']::text[]);
create or replace function private.set_staff_permissions(target text,display_name text,permissions text[]) returns void language plpgsql security definer set search_path='' as $$
declare normalized text[];begin
if not private.has_role('Administrator') then raise exception 'Administrator access required';end if;
if permissions is null or not(permissions <@ array['Administrator','Dashboard','Accounts','Applications','Assignments','Invoices','Students']::text[]) or array_position(permissions,null) is not null then raise exception 'Invalid permissions';end if;
select coalesce(array_agg(distinct p order by p),array[]::text[]) into normalized from unnest(permissions) p;
if lower(target)=lower(auth.jwt()->>'email') and not('Administrator'=any(normalized)) then raise exception 'You cannot remove your own administrator access';end if;
if length(trim(display_name))<1 or length(display_name)>100 then raise exception 'Enter a staff name';end if;
insert into private.staff_emails(email,name,role,roles) values(lower(target),trim(display_name),case when 'Administrator'=any(normalized) then 'Administrator' else coalesce(normalized[1],'Assignments') end,normalized)
on conflict(email) do update set name=excluded.name,role=excluded.role,roles=excluded.roles;
end $$;

create or replace function private.dashboard_totals() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
if not private.has_role('Dashboard') then raise exception 'Dashboard access required';end if;
return jsonb_build_object('students',(select count(*) from public.students),'accounts',(select count(*) from auth.users),'pendingApplications',(select count(*) from public.applications where status in ('Submitted','In review','Information requested','Waitlisted')),'unpaidInvoices',(select count(*) from public.invoices where status<>'Paid'),'outstandingCents',(select coalesce(sum(cents),0) from public.invoices where status<>'Paid'));
end $$;
create or replace function public.dashboard_totals() returns jsonb language sql stable set search_path='' as $$ select private.dashboard_totals() $$;
revoke all on function private.dashboard_totals() from public,anon;
revoke all on function public.dashboard_totals() from public,anon;
grant execute on function private.dashboard_totals() to authenticated;
grant execute on function public.dashboard_totals() to authenticated;
