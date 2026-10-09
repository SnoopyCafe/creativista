revoke all on function private.delete_staff_member(text) from public, anon;
revoke all on function private.delete_family_account(uuid) from public, anon;
revoke all on function public.delete_staff_member(text) from public, anon;
revoke all on function public.delete_family_account(uuid) from public, anon;
grant execute on function public.delete_staff_member(text) to authenticated, service_role;
grant execute on function public.delete_family_account(uuid) to authenticated, service_role;
