alter table public.assignment_library_students add column if not exists completed boolean not null default false;
create policy pool_student_update on public.assignment_library_students for update to authenticated
using (public.account_active() and private.has_role('Assignments'))
with check (public.account_active() and private.has_role('Assignments'));
