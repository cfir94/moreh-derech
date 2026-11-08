"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  adminEndAccess, adminGrant, adminLeads, adminPending, adminSaveCohort, adminSetHandled, adminUsers,
  cohortLabel, fetchCohorts, isAdmin, PLAN_LABEL, PLAN_MONTHS, renewalMessage,
  type AdminUser, type Cohort, type JoinPlan, type Lead, type PendingGrant,
} from "@/lib/manualAccess";

async function fetchAll() {
  try {
    const [leads, users, pending, cohorts] = await Promise.all([adminLeads(), adminUsers(), adminPending(), fetchCohorts(true)]);
    return { leads: leads ?? [], users: users ?? [], pending: pending ?? [], cohorts: cohorts ?? [], error: "" };
  } catch (err) {
    return { leads: [], users: [], pending: [], cohorts: [], error: `הטעינה נכשלה: ${(err as Error).message}` };
  }
}

type Tab = "leads" | "users" | "grant" | "cohorts";
const TABS: { id: Tab; label: string }[] = [
  { id: "leads", label: "פניות" },
  { id: "users", label: "משתמשים ומנויים" },
  { id: "grant", label: "הפעלת מנוי" },
  { id: "cohorts", label: "מחזורים" },
];

const field = "rounded-md border border-line bg-sheet px-3 py-2.5 text-base outline-none transition focus:border-teal";
const btn = "rounded-full border border-line bg-card-2 px-3.5 py-2 text-sm font-bold transition active:scale-95 disabled:opacity-60";
const primary = "rounded-full px-4 py-2.5 text-sm font-extrabold text-on-accent transition active:scale-95 disabled:opacity-60";
const primaryStyle = { background: "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)" };

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "2-digit" }) : "—");
const DAY = 86_400_000;

function accessLine(u: AdminUser) {
  const now = Date.now();
  const end = u.current_period_end ? Date.parse(u.current_period_end) : null;
  if (u.plan && u.plan !== "trial" && end && end > now) return { text: `${PLAN_LABEL[u.plan] ?? u.plan} עד ${day(u.current_period_end)}`, tone: end - now < 30 * DAY ? "warn" : "ok" };
  const trial = u.trial_ends_at ? Date.parse(u.trial_ends_at) : null;
  if (trial && trial > now) return { text: `ניסיון עד ${day(u.trial_ends_at)}`, tone: "trial" };
  if (u.has_access) return { text: PLAN_LABEL[u.plan ?? ""] ?? "גישה", tone: "ok" };
  return { text: u.plan ? "פג" : "בלי גישה", tone: "off" };
}

/** מסך המנהל (B-04): פניות, משתמשים ומנויים, הפעלת מנוי אחרי תשלום, ומחזורים. ההרשאה נבדקת ב-Supabase. */
export function AdminPanel() {
  const { user, ready } = useUser();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pending, setPending] = useState<PendingGrant[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!ready) return;
    void (user ? isAdmin() : Promise.resolve(false)).then(setAllowed);
  }, [ready, user]);

  const apply = useCallback((data: Awaited<ReturnType<typeof fetchAll>>) => {
    setError(data.error);
    setLeads(data.leads);
    setUsers(data.users);
    setPending(data.pending);
    setCohorts(data.cohorts);
  }, []);
  const load = useCallback(async () => apply(await fetchAll()), [apply]);

  useEffect(() => {
    if (allowed) void fetchAll().then(apply);
  }, [allowed, apply]);

  if (!ready || allowed === null) return null;
  if (!allowed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="mb-2 text-2xl font-black text-txt">אין גישה</h1>
        <p className="text-txt-dim">המסך הזה למנהלי האתר בלבד. <Link href="/login/" className="font-bold text-teal">כניסה</Link></p>
      </div>
    );
  }

  const openLeads = leads.filter((l) => !l.handled).length;

  return (
    <div className="screen-in mx-auto max-w-5xl px-4 py-8" data-admin>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="grad-text text-3xl">ניהול</h1>
          <p className="text-sm text-txt-dim">
            {users.length} משתמשים · {users.filter((u) => u.plan && u.plan !== "trial" && u.has_access).length} מנויים פעילים · {openLeads} פניות פתוחות
          </p>
        </div>
        <button type="button" onClick={() => void load()} className={btn}>רענון</button>
      </header>

      <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); setNotice(""); }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${tab === t.id ? "text-on-accent" : "border border-line bg-card text-txt"}`}
            style={tab === t.id ? primaryStyle : undefined}
          >
            {t.label}
            {t.id === "leads" && openLeads > 0 ? ` (${openLeads})` : ""}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 text-sm font-bold text-red">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-md border border-line bg-card p-3 text-sm font-bold text-txt">{notice}</p>}

      {tab === "leads" && <Leads leads={leads} onToggle={async (l) => { await adminSetHandled(l.id, !l.handled); await load(); }} />}
      {tab === "users" && <Users users={users} onEnd={async (u) => {
        if (!confirm(`לסיים עכשיו את הגישה של ${u.email}?`)) return;
        await adminEndAccess(u.user_id);
        await load();
      }} onCopy={(text) => { void navigator.clipboard?.writeText(text); setNotice("ההודעה הועתקה."); }} />}
      {tab === "grant" && <Grant pending={pending} onGrant={async (email, plan) => {
        const months = plan === "comp" ? 12 : PLAN_MONTHS[plan];
        const result = await adminGrant(email, plan, months);
        setNotice(result === "active"
          ? `הופעל: ${email}, ${PLAN_LABEL[plan]}.`
          : `${email} עוד לא נרשם. המנוי נשמר ויופעל ברגע שיירשם עם המייל הזה.`);
        await load();
      }} />}
      {tab === "cohorts" && <Cohorts cohorts={cohorts} onSave={async (c) => { await adminSaveCohort(c); await load(); setNotice("המחזור נשמר."); }} />}
    </div>
  );
}

function Leads({ leads, onToggle }: { leads: Lead[]; onToggle: (l: Lead) => Promise<void> }) {
  if (!leads.length) return <p className="text-txt-dim">עוד אין פניות.</p>;
  return (
    <ul className="flex flex-col gap-2" data-admin-leads>
      {leads.map((l) => (
        <li key={l.id} className={`rounded-lg border border-line bg-card p-4 ${l.handled ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-black text-txt">
                {l.kind === "join" ? `רוצה ${PLAN_LABEL[l.plan ?? ""] ?? "מנוי"}` : "נרשם/ה לניסיון"} · {l.full_name || "בלי שם"}
              </p>
              <p className="text-sm text-txt-dim">
                <a href={`mailto:${l.email}`} dir="ltr" className="text-teal">{l.email}</a>
                {l.phone && <> · <a href={`tel:${l.phone}`} dir="ltr" className="text-teal">{l.phone}</a></>}
                {" · "}{day(l.created_at)}
              </p>
              {l.note && <p className="mt-1 text-sm text-txt">{l.note}</p>}
            </div>
            <button type="button" onClick={() => void onToggle(l)} className={btn}>{l.handled ? "החזרה לפתוחות" : "טופל ✓"}</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Users({ users, onEnd, onCopy }: { users: AdminUser[]; onEnd: (u: AdminUser) => Promise<void>; onCopy: (text: string) => void }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? users.filter((u) => `${u.email} ${u.full_name} ${u.phone} ${u.cohort}`.toLowerCase().includes(q)) : users;
  }, [users, query]);
  return (
    <div data-admin-users>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש לפי שם, מייל, טלפון או מחזור" aria-label="חיפוש משתמשים" className={`${field} mb-3 w-full`} />
      <ul className="flex flex-col gap-2">
        {shown.map((u) => {
          const a = accessLine(u);
          const color = a.tone === "ok" ? "text-green" : a.tone === "warn" ? "text-gold" : a.tone === "trial" ? "text-teal" : "text-txt-dim";
          return (
            <li key={u.user_id} className="rounded-lg border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-black text-txt">{u.full_name || u.email}</p>
                  <p className="text-sm text-txt-dim">
                    <span dir="ltr">{u.email}</span>{u.phone && <> · <span dir="ltr">{u.phone}</span></>}{u.cohort && <> · {u.cohort}</>}
                  </p>
                  <p className="text-xs text-txt-dim">נרשם {day(u.signed_up)} · כניסה אחרונה {day(u.last_sign_in)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-sm font-bold ${color}`}>{a.text}</span>
                  <div className="flex gap-1.5">
                    {a.tone === "warn" && u.current_period_end && (
                      <button type="button" className={btn} onClick={() => onCopy(renewalMessage(u.full_name, u.current_period_end!))}>הודעת חידוש</button>
                    )}
                    {u.has_access && u.plan && u.plan !== "trial" && <button type="button" className={btn} onClick={() => void onEnd(u)}>סיום גישה</button>}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Grant({ pending, onGrant }: { pending: PendingGrant[]; onGrant: (email: string, plan: JoinPlan | "comp") => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const plan = String(form.get("plan") ?? "yearly") as JoinPlan | "comp";
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("מייל לא תקין.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onGrant(email, plan);
      event.currentTarget.reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div data-admin-grant>
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5 sm:max-w-md">
        <p className="text-sm text-txt-dim">אחרי שהתשלום התקבל. מנוי קיים מוארך מסוף התקופה הנוכחית.</p>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          המייל של המנוי
          <input name="email" type="email" required dir="ltr" className={field} />
        </label>
        <fieldset className="flex flex-wrap gap-3 text-sm">
          <legend className="mb-1.5 font-bold">תקופה</legend>
          <label className="flex items-center gap-1.5"><input type="radio" name="plan" value="halfyear" /> חצי שנה</label>
          <label className="flex items-center gap-1.5"><input type="radio" name="plan" value="yearly" defaultChecked /> שנה</label>
          <label className="flex items-center gap-1.5"><input type="radio" name="plan" value="comp" /> מתנה (שנה)</label>
        </fieldset>
        <button type="submit" disabled={busy} className={primary} style={primaryStyle}>{busy ? "מפעיל…" : "הפעלה"}</button>
        {error && <p role="alert" className="text-sm font-bold text-red">{error}</p>}
      </form>
      {pending.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-black text-txt">ממתינים להרשמה</h2>
          <ul className="flex flex-col gap-1 text-sm text-txt">
            {pending.map((p) => <li key={p.email}><span dir="ltr">{p.email}</span> · {PLAN_LABEL[p.plan] ?? p.plan} · מ-{day(p.created_at)}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}

function Cohorts({ cohorts, onSave }: { cohorts: Cohort[]; onSave: (c: Omit<Cohort, "id"> & { id?: number }) => Promise<void> }) {
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const school = String(form.get("school") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    const year = Number(form.get("year"));
    const code = String(form.get("code") ?? "").trim() || `${name} ${year}`;
    if (!school || !name || !year) {
      setError("צריך בית ספר, שם ושנה.");
      return;
    }
    setError("");
    try {
      await onSave({ school, name, year, code, active: true });
      event.currentTarget.reset();
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <div data-admin-cohorts>
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-lg border border-line bg-card p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-bold">בית ספר<input name="school" required className={field} placeholder="למשל: קמ״ד" /></label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">שם המחזור<input name="name" required className={field} placeholder="למשל: שרון" /></label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">שנה<input name="year" type="number" required min={2000} max={2100} defaultValue={new Date().getFullYear()} className={field} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          קוד הכיתה במשחק <span className="font-normal text-txt-dim">(אם יש; כך יופיעו באותה טבלה)</span>
          <input name="code" className={field} />
        </label>
        <button type="submit" className={`${primary} sm:col-span-2`} style={primaryStyle}>הוספת מחזור</button>
        {error && <p role="alert" className="text-sm font-bold text-red sm:col-span-2">{error}</p>}
      </form>
      <ul className="flex flex-col gap-2">
        {cohorts.map((c) => (
          <li key={c.id} className={`flex items-center justify-between gap-2 rounded-lg border border-line bg-card p-3 ${c.active === false ? "opacity-60" : ""}`}>
            <span className="text-sm text-txt">{cohortLabel(c)} <span className="text-txt-dim">· קוד: {c.code}</span></span>
            <button type="button" className={btn} onClick={() => void onSave({ ...c, active: c.active === false })}>
              {c.active === false ? "הפעלה" : "הסתרה מההרשמה"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
