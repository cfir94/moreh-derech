"use client";
/*
 * הקהילה (C-10): פורום המחזור ולוח הפרסומים. כל הקריאות ב-src/lib/community.ts, וכל ההרשאות
 * נאכפות ב-Supabase. עמוד אחד, והמצב בכתובת: ?f=<slug> לפורום, ?f=<slug>&t=<id> לנושא, ו-&new=1
 * לנושא חדש, כך שכפתור "חזרה" עובד. קהל של 40–60: טקסט 16px ומעלה, כפתורים 48px.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  adminHide, adminPin, markRead, myForums, openThread, reply, requestJoin, thread as loadThread, threads as loadThreads,
  type Forum, type Post, type Thread,
} from "@/lib/community";
import { isAdmin } from "@/lib/manualAccess";

import { kit as k, PenUnderline } from "@/components/trail/kit";
import { InkIcon } from "@/components/trail/Ink";
import { PageDecor } from "@/components/trail/PageDecor";
const primary = `${k.sign} ${k.signPlain} disabled:opacity-60`;
const primaryStyle = undefined;
const small = "min-h-10 rounded-full border border-line px-3 text-sm font-bold text-txt-dim transition hover:text-txt active:scale-95";

export function ago(iso: string | null, now = Date.now()) {
  if (!iso) return "";
  const minutes = Math.round((now - Date.parse(iso)) / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "לפני שעה" : `לפני ${hours} שעות`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? "אתמול" : `לפני ${days} ימים`;
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long" });
}

/** טקסט של הודעה: שורות נשמרות, וכתובות http(s) הופכות לקישור. בלי HTML. */
export function PostText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>"']+)/g);
  return <p className="whitespace-pre-line break-words text-base leading-8">
    {parts.map((part, i) => /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="font-bold text-teal underline underline-offset-4">{part}</a>
      : <span key={i}>{part}</span>)}
  </p>;
}

function Shell({ title, back, children }: { title: string; back?: { href: string; label: string }; children: ReactNode }) {
  return <main dir="rtl" className="screen-in relative mx-auto w-full max-w-3xl px-4 py-8">
    <PageDecor birds items={["community", "tent", "talk", "canteen", "butterfly"]} />
    {back && <Link href={back.href} className="mb-4 inline-flex min-h-11 items-center text-base font-bold text-txt-dim hover:text-txt">→ {back.label}</Link>}
    <div className="relative mb-6">
      <h1 className="grad-text">{title}</h1>
      <PenUnderline />
      <span aria-hidden className="absolute top-0 left-0 hidden opacity-70 sm:block">
        <InkIcon name="community" size={92} />
      </span>
    </div>
    {children}
  </main>;
}

function ErrorLine({ error }: { error: string }) {
  return error ? <p role="alert" className="mb-4 rounded-md border border-line bg-card px-4 py-3 font-bold text-red">{error}</p> : null;
}

// ------------------------------------------------------------------ forums

function ForumList({ forums, onJoin }: { forums: Forum[]; onJoin: (f: Forum) => Promise<void> }) {
  const [busy, setBusy] = useState<number | null>(null);
  if (!forums.length) return <p className="rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] p-5 text-base text-txt-dim">עוד אין כאן פורומים.</p>;
  return <ul className="space-y-3">
    {forums.map((f) => {
      const open = f.member || f.kind === "board";
      const body = <>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-black">{f.title}</h2>
          {f.member && f.unread > 0 && <span className="shrink-0 rounded-full bg-red px-3 py-1 text-sm font-black text-on-accent">{f.unread} חדשות</span>}
        </div>
        {f.description && <p className="mt-1 text-base leading-7 text-txt-dim">{f.description}</p>}
        {f.last_activity && <p className="mt-2 text-sm text-txt-dim">פעילות אחרונה: {ago(f.last_activity)}</p>}
      </>;
      return <li key={f.id} className="rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)]">
        {open ? <Link href={`/community/?f=${f.slug}`} className="block p-5 transition hover:bg-card-2">{body}</Link> : <div className="p-5">
          {body}
          <div className="mt-4">
            {f.request === "pending" ? <p className="font-bold text-txt-dim">⏳ הבקשה ממתינה לאישור</p>
              : f.request === "banned" ? null
              : <button type="button" disabled={busy === f.id} onClick={async () => { setBusy(f.id); await onJoin(f); setBusy(null); }} className={primary} style={primaryStyle}>בקשה להצטרף</button>}
          </div>
        </div>}
      </li>;
    })}
  </ul>;
}

// ------------------------------------------------------------------ one forum

function ThreadList({ forum, list, admin, onAdmin }: { forum: Forum; list: Thread[]; admin: boolean; onAdmin: () => void }) {
  const visible = list.filter((t) => admin || !t.hidden);
  if (!visible.length) return <p className="rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] p-5 text-base text-txt-dim">{forum.kind === "board" ? "עוד אין פרסומים." : "עוד אין נושאים. פתחו את הראשון."}</p>;
  if (forum.kind === "board") {
    return <ul className="space-y-3">
      {visible.map((t) => <li key={t.id} className={`rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] ${t.hidden ? "opacity-50" : ""}`}>
        <Link href={`/community/?f=${forum.slug}&t=${t.id}`} className="block p-5 transition hover:bg-card-2">
          <p className="text-sm font-bold text-txt-dim">{t.pinned && "📌 "}{new Date(t.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}{t.hidden && " · מוסתר"}</p>
          <h2 className="mt-1 text-xl font-black">{t.title}</h2>
          <p className="mt-2 text-base leading-7 text-txt-dim">{t.body.length > 200 ? `${t.body.slice(0, 200)}…` : t.body}</p>
        </Link>
        {admin && <AdminRow thread={t} onDone={onAdmin} />}
      </li>)}
    </ul>;
  }
  return <ul className="divide-y divide-line overflow-hidden rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)]">
    {visible.map((t) => <li key={t.id} className={t.hidden ? "opacity-50" : ""}>
      <Link href={`/community/?f=${forum.slug}&t=${t.id}`} className="flex items-center gap-3 p-4 transition hover:bg-card-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black leading-7">{t.pinned && "📌 "}{t.title}{t.hidden && <span className="mr-2 text-sm text-txt-dim">(מוסתר)</span>}</h2>
          <p className="text-sm text-txt-dim">{t.author_name} · {t.post_count} תגובות · {ago(t.last_post_at)}</p>
        </div>
        <span aria-hidden className="text-xl text-txt-dim">‹</span>
      </Link>
      {admin && <AdminRow thread={t} onDone={onAdmin} />}
    </li>)}
  </ul>;
}

function AdminRow({ thread, post, onDone }: { thread?: Thread; post?: Post; onDone: () => void }) {
  const item = thread ?? post!;
  return <div className="flex flex-wrap gap-2 border-t border-line px-4 py-2">
    <span className="ml-auto self-center text-sm font-bold text-txt-dim">מנהל</span>
    <button type="button" className={small} onClick={async () => { await adminHide(thread ? "thread" : "post", item.id, !item.hidden); onDone(); }}>{item.hidden ? "החזרה" : "הסתרה"}</button>
    {thread && <button type="button" className={small} onClick={async () => { await adminPin(thread.id, !thread.pinned); onDone(); }}>{thread.pinned ? "ביטול הצמדה" : "הצמדה"}</button>}
  </div>;
}

function NewThread({ forum, onCreated }: { forum: Forum; onCreated: (t: Thread) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ok = title.trim().length >= 3 && title.trim().length <= 140 && body.trim().length > 0;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    setBusy(true); setError("");
    try { onCreated(await openThread(forum.id, title, body)); }
    catch (err) { setError(`לא נשמר: ${(err as Error).message}`); setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-4 rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] p-5">
    <ErrorLine error={error} />
    <label className="block text-base font-bold">כותרת
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} required className="mt-1 min-h-12 w-full rounded-md border border-line bg-sheet px-4 text-base font-normal outline-none focus:border-teal" />
    </label>
    <label className="block text-base font-bold">{forum.kind === "board" ? "הפרסום" : "ההודעה"}
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} required className="mt-1 w-full rounded-md border border-line bg-sheet px-4 py-3 text-base font-normal leading-7 outline-none focus:border-teal" />
    </label>
    <button type="submit" disabled={!ok || busy} className={primary} style={primaryStyle}>{busy ? "שולח…" : forum.kind === "board" ? "פרסום" : "פתיחת הנושא"}</button>
  </form>;
}

// ------------------------------------------------------------------ one thread

function ThreadView({ forum, threadId, admin }: { forum: Forum; threadId: number; admin: boolean }) {
  const [data, setData] = useState<{ thread: Thread | null; posts: Post[] } | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(() => loadThread(threadId).then(setData, (e: Error) => setError(e.message)), [threadId]);
  useEffect(() => { void load(); }, [load]);

  if (error && !data) return <ErrorLine error={`הטעינה נכשלה: ${error}`} />;
  if (!data) return <p className="text-base text-txt-dim">טוען…</p>;
  if (!data.thread) return <p className="text-base text-txt-dim">הנושא לא נמצא.</p>;
  const t = data.thread;
  const posts = data.posts.filter((p) => admin || !p.hidden);
  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true); setError("");
    try { await reply(t.id, text); setText(""); await load(); }
    catch (err) { setError(`לא נשלח: ${(err as Error).message}`); }
    setBusy(false);
  };
  return <div className="space-y-3">
    <article className={`rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] ${t.hidden ? "opacity-50" : ""}`}>
      <div className="p-5">
        <p className="text-sm font-bold text-txt-dim">{t.author_name} · {ago(t.created_at)}{t.hidden && " · מוסתר"}</p>
        <h2 className="mb-3 mt-1 text-2xl font-black">{t.pinned && "📌 "}{t.title}</h2>
        <PostText text={t.body} />
      </div>
      {admin && <AdminRow thread={t} onDone={() => void load()} />}
    </article>
    {posts.map((p) => <article key={p.id} className={`rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] ${p.hidden ? "opacity-50" : ""}`}>
      <div className="p-5">
        <p className="mb-2 text-sm font-bold text-txt-dim">{p.author_name} · {ago(p.created_at)}{p.hidden && " · מוסתר"}</p>
        <PostText text={p.body} />
      </div>
      {admin && <AdminRow post={p} onDone={() => void load()} />}
    </article>)}
    {forum.kind === "forum" && forum.member && <form onSubmit={send} className="space-y-3 rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] p-5">
      <ErrorLine error={error} />
      <label className="block text-base font-bold">תגובה
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-line bg-sheet px-4 py-3 text-base font-normal leading-7 outline-none focus:border-teal" />
      </label>
      <button type="submit" disabled={busy || !text.trim()} className={primary} style={primaryStyle}>{busy ? "שולח…" : "שליחה"}</button>
    </form>}
  </div>;
}

// ------------------------------------------------------------------ page

export function Community() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, ready } = useUser();
  const slug = params.get("f");
  const threadId = Number(params.get("t")) || null;
  const creating = params.get("new") === "1";
  const [forums, setForums] = useState<Forum[] | null>(null);
  const [list, setList] = useState<Thread[] | null>(null);
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState("");

  const loadForums = useCallback(() => myForums().then(setForums, (e: Error) => { setForums([]); setError(e.message); }), []);
  useEffect(() => {
    if (!ready || !user) return;
    void loadForums();
    void isAdmin().then(setAdmin);
  }, [ready, user, loadForums]);

  const forum = useMemo(() => forums?.find((f) => f.slug === slug) ?? null, [forums, slug]);
  const loadList = useCallback(() => forum ? loadThreads(forum.id).then(setList, (e: Error) => setError(e.message)) : Promise.resolve(), [forum]);
  useEffect(() => {
    if (!forum || threadId || creating) return;
    void loadList();
    if (forum.member) void markRead(forum.id);
  }, [forum, threadId, creating, loadList]);

  if (!ready) return null;
  if (!user) return <Shell title="קהילה">
    <div className="rounded-[5px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--line),var(--shadow)] p-6 text-base leading-8">
      <p>כאן נמצאים פורום המחזור ולוח הפרסומים על השתלמויות וקורסים. כדי לקרוא ולכתוב צריך להתחבר.</p>
      <Link href="/login/" className={`${primary} mt-4 inline-flex items-center`} style={primaryStyle}>כניסה</Link>
    </div>
  </Shell>;
  if (!forums) return <Shell title="קהילה"><p className="text-base text-txt-dim">טוען…</p></Shell>;

  if (!slug) return <Shell title="קהילה">
    <ErrorLine error={error} />
    <p className="mb-5 text-base leading-7 text-txt-dim">פורום המחזור שלכם ולוח הפרסומים. הודעות מופיעות מיד, והמנהל עובר עליהן.</p>
    <ForumList forums={forums} onJoin={async (f) => {
      try { await requestJoin(f.id); await loadForums(); } catch (e) { setError(`הבקשה לא נשלחה: ${(e as Error).message}`); }
    }} />
  </Shell>;

  if (!forum) return <Shell title="קהילה" back={{ href: "/community/", label: "כל הפורומים" }}><p className="text-base text-txt-dim">הפורום לא נמצא, או שאין לכם גישה אליו.</p></Shell>;

  if (threadId) return <Shell title={forum.title} back={{ href: `/community/?f=${forum.slug}`, label: forum.kind === "board" ? "כל הפרסומים" : "כל הנושאים" }}>
    <ThreadView forum={forum} threadId={threadId} admin={admin} />
  </Shell>;

  if (creating && forum.can_open) return <Shell title={forum.kind === "board" ? "פרסום חדש" : "נושא חדש"} back={{ href: `/community/?f=${forum.slug}`, label: forum.title }}>
    <NewThread forum={forum} onCreated={(t) => router.push(`/community/?f=${forum.slug}&t=${t.id}`)} />
  </Shell>;

  return <Shell title={forum.title} back={{ href: "/community/", label: "כל הפורומים" }}>
    <ErrorLine error={error} />
    {forum.description && <p className="mb-4 text-base leading-7 text-txt-dim">{forum.description}</p>}
    {forum.can_open && <Link href={`/community/?f=${forum.slug}&new=1`} className={`${primary} mb-5 inline-flex items-center`} style={primaryStyle}>{forum.kind === "board" ? "＋ פרסום חדש" : "＋ נושא חדש"}</Link>}
    {list ? <ThreadList forum={forum} list={list} admin={admin} onAdmin={() => void loadList()} /> : <p className="text-base text-txt-dim">טוען…</p>}
  </Shell>;
}
