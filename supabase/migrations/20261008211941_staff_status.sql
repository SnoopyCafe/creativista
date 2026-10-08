create or replace function private.staff_directory()
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if not private.has_role('Administrator') then
    raise exception 'Administrator access required';
  end if;

  return (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'email', s.email,
          'name', coalesce(nullif(s.name, ''), u.raw_user_meta_data->>'name', ''),
          'role', s.role,
          'roles', s.roles,
          'user_id', u.id,
          'last_login', u.last_sign_in_at,
          'suspended', coalesce(a.suspended, false)
        ) order by s.email
      ),
      '[]'::jsonb
    )
    from private.staff_emails s
    left join auth.users u on lower(u.email)=s.email
    left join private.account_status a on a.user_id=u.id
  );
end
$$;
