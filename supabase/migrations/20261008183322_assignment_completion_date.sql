alter table public.assignment_library_students add column if not exists completed_at timestamptz, add column if not exists due date;
create or replace function private.assignment_completion_timestamp() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.completed and (tg_op = 'INSERT' or not old.completed) then
    new.completed_at := now();
  elsif not new.completed then
    new.completed_at := null;
  else
    new.completed_at := old.completed_at;
  end if;
  return new;
end;
$$;
revoke all on function private.assignment_completion_timestamp() from public, anon, authenticated;
create trigger assignment_completion_timestamp before insert or update on public.assignment_library_students
for each row execute function private.assignment_completion_timestamp();

alter table public.assignments add column if not exists completed_at timestamptz;
create or replace function private.legacy_assignment_completion_timestamp() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'Completed' and (tg_op = 'INSERT' or old.status <> 'Completed') then
    new.completed_at := now();
  elsif new.status <> 'Completed' then
    new.completed_at := null;
  else
    new.completed_at := old.completed_at;
  end if;
  return new;
end;
$$;
revoke all on function private.legacy_assignment_completion_timestamp() from public, anon, authenticated;
create trigger legacy_assignment_completion_timestamp before insert or update on public.assignments
for each row execute function private.legacy_assignment_completion_timestamp();
