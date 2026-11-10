-- הפתקים שלי (N-05): מאגר נוסף בטבלת md_user_data.
-- להרצה: Supabase ← SQL Editor ← Run. אידמפוטנטי. עד שהיא רצה, הפתקים נשמרים רק במכשיר,
-- ושאר הסנכרון ממשיך כרגיל (cloudSync.ts מדלג על מאגר שהשרת דוחה).

alter table public.md_user_data drop constraint if exists md_user_data_store_check;
alter table public.md_user_data add constraint md_user_data_store_check
  check (store in ('progress', 'learning-map', 'crossword', 'guide-drafts', 'notes'));
