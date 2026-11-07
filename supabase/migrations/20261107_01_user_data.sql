-- S-02: נתוני הלמידה של כל משתמש בחשבון, ולא רק בדפדפן.
-- שורה אחת לכל משתמש ומאגר: התקדמות וטעויות, מפת הלמידה, התשבצים וטיוטות הדוחות.
-- עקרונות:
--   * משתמש קורא וכותב רק את השורות שלו (RLS לפי auth.uid()). אורח לא מגיע לכאן בכלל.
--   * התוכן הוא מסמך jsonb שהאתר ממזג (src/lib/sync/merge.ts). השרת רק שומר.
--   * rev מאפשר עדכון אופטימי: האתר מעדכן רק אם rev לא השתנה מאז שקרא, אחרת קורא וממזג שוב.
--   * מחיקת המשתמש מוחקת את הנתונים שלו (on delete cascade).
--   * הקידומת md_ מפרידה מטבלאות המשחק "אבן דרך", שחולק את אותו פרויקט Supabase.
-- להרצה: Supabase ← SQL Editor ← Run. אידמפוטנטי, ואינו נוגע בשום טבלה קיימת.

create table if not exists public.md_user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  store text not null
    check (store in ('progress', 'learning-map', 'crossword', 'guide-drafts')),
  data jsonb not null,
  rev integer not null default 1 check (rev > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, store),
  -- מסמך של משתמש פעיל במיוחד הוא כמה מאות KB. 2MB עוצר תקלה, לא שימוש.
  constraint md_user_data_size check (pg_column_size(data) <= 2000000)
);

alter table public.md_user_data enable row level security;

drop policy if exists "md_user_data_select_own" on public.md_user_data;
create policy "md_user_data_select_own" on public.md_user_data
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "md_user_data_insert_own" on public.md_user_data;
create policy "md_user_data_insert_own" on public.md_user_data
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "md_user_data_update_own" on public.md_user_data;
create policy "md_user_data_update_own" on public.md_user_data
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "md_user_data_delete_own" on public.md_user_data;
create policy "md_user_data_delete_own" on public.md_user_data
  for delete to authenticated
  using (auth.uid() = user_id);

revoke all on public.md_user_data from anon;
grant select, insert, update, delete on public.md_user_data to authenticated;

create or replace function public.md_user_data_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists md_user_data_touch on public.md_user_data;
create trigger md_user_data_touch
  before update on public.md_user_data
  for each row execute function public.md_user_data_touch();

-- בדיקה אחרי ההרצה (אמור להחזיר שורה אחת עם 4 מדיניות):
-- select relname, relrowsecurity,
--        (select count(*) from pg_policies where tablename = 'md_user_data') as policies
-- from pg_class where relname = 'md_user_data';
