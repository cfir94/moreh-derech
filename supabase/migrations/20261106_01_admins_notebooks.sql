-- S-01: כתיבה למחברות הקורס רק למנהלים.
-- עד עכשיו כל משתמש מחובר יכול היה להוסיף מחברת דרך ה-API (הממשק הסתיר את הכפתור, אבל ה-RLS
-- התיר). כשההרשמה נפתחת לכולם זה חור: כל נרשם יכול לפרסם קישור באתר.
-- להרצה: Supabase ← SQL Editor ← הדבקה ← Run. אידמפוטנטי: מותר להריץ שוב.

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;
-- אין policy: הטבלה נקראת רק דרך is_app_admin() (security definer) או ע"י service_role.
revoke all on public.app_admins from anon, authenticated;

create or replace function public.is_app_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_admins where user_id = uid);
$$;

revoke all on function public.is_app_admin(uuid) from public;
grant execute on function public.is_app_admin(uuid) to anon, authenticated;

-- הבעלים (cfir94) — אותו מזהה שמופיע ב-src/components/notebooks/NotebookLibrary.tsx.
insert into public.app_admins (user_id, note)
values ('e1fb8bb7-1c86-46ce-891a-b616f011d795', 'owner')
on conflict (user_id) do nothing;

drop policy if exists "course_notebooks_authenticated_insert" on public.course_notebooks;
drop policy if exists "course_notebooks_admin_insert" on public.course_notebooks;
create policy "course_notebooks_admin_insert" on public.course_notebooks
  for insert to authenticated
  with check (public.is_app_admin() and auth.uid() = owner_id);

drop policy if exists "course_notebooks_owner_update" on public.course_notebooks;
drop policy if exists "course_notebooks_admin_update" on public.course_notebooks;
create policy "course_notebooks_admin_update" on public.course_notebooks
  for update to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

drop policy if exists "course_notebooks_owner_delete" on public.course_notebooks;
drop policy if exists "course_notebooks_admin_delete" on public.course_notebooks;
create policy "course_notebooks_admin_delete" on public.course_notebooks
  for delete to authenticated
  using (public.is_app_admin());

-- בדיקה אחרי ההרצה (אמור להחזיר שורה אחת):
-- select * from public.app_admins;
