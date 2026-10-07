create or replace function private.edit_staff_profile(original_email text,target text,display_name text,permissions text[]) returns void language plpgsql security definer set search_path='' as $$
begin
if not private.has_role('Administrator') then raise exception 'Administrator access required';end if;
if lower(original_email)<>lower(target) then
if lower(original_email)=lower(auth.jwt()->>'email') then raise exception 'You cannot change your own sign-in email here';end if;
if not exists(select 1 from private.staff_emails where email=lower(original_email)) then raise exception 'Staff record not found';end if;
if exists(select 1 from private.staff_emails where email=lower(target)) then raise exception 'Email is already used by another staff member';end if;
end if;
perform private.set_staff_permissions(target,display_name,permissions);
if lower(original_email)<>lower(target) then delete from private.staff_emails where email=lower(original_email);end if;
end $$;
create or replace function public.edit_staff_profile(original_email text,target text,display_name text,permissions text[]) returns void language sql set search_path='' as $$ select private.edit_staff_profile(original_email,target,display_name,permissions) $$;
revoke all on function private.edit_staff_profile(text,text,text,text[]) from public,anon;
revoke all on function public.edit_staff_profile(text,text,text,text[]) from public,anon;
grant execute on function private.edit_staff_profile(text,text,text,text[]) to authenticated;
grant execute on function public.edit_staff_profile(text,text,text,text[]) to authenticated;
