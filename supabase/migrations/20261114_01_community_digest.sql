-- C-12: מייל יומי מרוכז עם ההודעות החדשות בקהילה, רק למי שבחר בו.
-- עקרונות:
--   * ברירת המחדל כבויה. המשתמש מדליק ומכבה בעצמו, במסך הקהילה (md_digest_prefs, RLS על השורה שלו).
--   * ה-Worker של האתר (deploy/site/notify.ts) קורא פעם ביום, במפתח השירות, למי לשלוח (md_digest_recipients)
--     ומה חדש בשבילו (md_digest_items), ואחרי השליחה מסמן (md_digest_mark). שלוש הפונקציות האלה
--     סגורות ל-anon ול-authenticated: רק מפתח השירות קורא להן.
--   * "מה חדש" = נושאים ותגובות שלא הוסתרו, מאחרים, בפורומים שהמשתמש חבר בהם (md_forum_member),
--     מאז המייל הקודם, ולכל היותר מ-24 השעות האחרונות.
--   * הסרה בלחיצה מהמייל: לכל שורה אסימון אקראי (token). md_digest_off(token) מכבה בלי התחברות,
--     ומחזיר רק אם הצליח. האסימון לא חושף דבר מלבד היכולת לכבות את המייל של אותו משתמש.
-- להרצה: Supabase ← SQL Editor ← Run. אידמפוטנטי. דורש 20261110_01_community.

create table if not exists public.md_digest_prefs (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  daily boolean not null default false,
  token uuid not null default gen_random_uuid() unique,
  last_sent_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.md_digest_prefs enable row level security;

drop policy if exists md_digest_prefs_own_select on public.md_digest_prefs;
create policy md_digest_prefs_own_select on public.md_digest_prefs
  for select to authenticated using (user_id = auth.uid());

drop policy if exists md_digest_prefs_own_insert on public.md_digest_prefs;
create policy md_digest_prefs_own_insert on public.md_digest_prefs
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists md_digest_prefs_own_update on public.md_digest_prefs;
create policy md_digest_prefs_own_update on public.md_digest_prefs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- המשתמש לא משנה בעצמו את האסימון ואת מועד השליחה האחרון: רק daily.
revoke update on public.md_digest_prefs from authenticated;
grant select, insert on public.md_digest_prefs to authenticated;
grant update (daily, updated_at) on public.md_digest_prefs to authenticated;

-- למי שולחים היום: מי שהדליק, עם המייל והשם שלו.
create or replace function public.md_digest_recipients()
returns table (user_id uuid, email text, full_name text, token uuid, since timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select d.user_id, u.email::text, coalesce(p.full_name, ''), d.token,
         greatest(coalesce(d.last_sent_at, now() - interval '1 day'), now() - interval '1 day')
    from public.md_digest_prefs d
    join auth.users u on u.id = d.user_id
    left join public.md_profiles p on p.user_id = d.user_id
   where d.daily and u.email is not null;
$$;
revoke all on function public.md_digest_recipients() from public, anon, authenticated;

-- מה חדש בשביל משתמש אחד מאז `since`: נושאים חדשים ותגובות חדשות, בלי מוסתרים ובלי שלו.
create or replace function public.md_digest_items(uid uuid, since timestamptz)
returns table (forum_title text, forum_slug text, thread_id bigint, thread_title text, kind text,
               author_name text, excerpt text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select f.title, f.slug, t.id, t.title, 'thread', t.author_name, left(t.body, 160), t.created_at
    from public.md_threads t join public.md_forums f on f.id = t.forum_id
   where not t.hidden and t.author_id <> uid and t.created_at > since
     and public.md_forum_member(f.id, uid)
  union all
  select f.title, f.slug, t.id, t.title, 'post', p.author_name, left(p.body, 160), p.created_at
    from public.md_posts p join public.md_threads t on t.id = p.thread_id join public.md_forums f on f.id = t.forum_id
   where not p.hidden and not t.hidden and p.author_id <> uid and p.created_at > since
     and public.md_forum_member(f.id, uid)
   order by 8 desc
   limit 40;
$$;
revoke all on function public.md_digest_items(uuid, timestamptz) from public, anon, authenticated;

-- אחרי שליחה מוצלחת.
create or replace function public.md_digest_mark(uid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.md_digest_prefs set last_sent_at = now() where user_id = uid;
$$;
revoke all on function public.md_digest_mark(uuid) from public, anon, authenticated;

-- הסרה בלחיצה מהמייל, בלי התחברות.
create or replace function public.md_digest_off(t uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  update public.md_digest_prefs set daily = false, updated_at = now() where token = t and daily;
  get diagnostics n = row_count;
  return n > 0 or exists (select 1 from public.md_digest_prefs where token = t);
end;
$$;
revoke all on function public.md_digest_off(uuid) from public;
grant execute on function public.md_digest_off(uuid) to anon, authenticated;
