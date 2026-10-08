alter table public.assignment_library_students add column if not exists assigned_on date;
alter table public.assignment_library_students alter column assigned_on set default ((now() at time zone 'America/New_York')::date);
