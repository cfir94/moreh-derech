"use client";

import { useEffect, useState } from "react";
import { adminRequests, adminSetMember, type MemberRequest } from "@/lib/community";

const STATUS: Record<MemberRequest["status"], string> = { pending: "ממתין", active: "חבר", banned: "חסום" };
const small = "rounded-full border border-line bg-card-2 px-3.5 py-2 text-sm font-bold transition active:scale-95 disabled:opacity-60";

/** לשונית "קהילה" במסך המנהל: בקשות הצטרפות, חסימה והרשאת פרסום בלוח. */
export function CommunityAdmin() {
  const [rows, setRows] = useState<MemberRequest[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = () => adminRequests().then((r) => setRows(r ?? []), (e: Error) => { setRows([]); setError(e.message); });
  useEffect(() => { void adminRequests().then((r) => setRows(r ?? []), (e: Error) => { setRows([]); setError(e.message); }); }, []);

  if (!rows) return <p className="text-txt-dim">טוען…</p>;
  const sorted = [...rows].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.created_at.localeCompare(a.created_at));
  const act = async (r: MemberRequest, status: "active" | "banned", role: "member" | "poster" = r.role) => {
    const key = `${r.forum_id}:${r.user_id}`;
    setBusy(key); setError("");
    try { await adminSetMember(r.forum_id, r.user_id, status, role); await load(); }
    catch (e) { setError(`הפעולה נכשלה: ${(e as Error).message}`); }
    setBusy("");
  };
  return <section className="space-y-3">
    {error && <p role="alert" className="font-bold text-red">{error}</p>}
    <p className="text-sm text-txt-dim">{rows.filter((r) => r.status === "pending").length} בקשות ממתינות · {rows.length} רשומות</p>
    {!sorted.length && <p className="paper-sheet p-4 text-txt-dim">אין בקשות.</p>}
    <ul className="space-y-2">
      {sorted.map((r) => {
        const key = `${r.forum_id}:${r.user_id}`;
        return <li key={key} className="flex flex-wrap items-center gap-3 paper-sheet p-4">
          <div className="min-w-0 flex-1">
            <p className="font-black">{r.full_name || r.email}</p>
            <p className="text-sm text-txt-dim">{r.email} · {r.forum_title} · {STATUS[r.status]}{r.role === "poster" ? " · מפרסם" : ""}</p>
          </div>
          {r.status !== "active" && <button type="button" disabled={busy === key} onClick={() => act(r, "active")} className={small}>אישור</button>}
          {r.status !== "banned" && <button type="button" disabled={busy === key} onClick={() => act(r, "banned")} className={small}>חסימה</button>}
          {r.status === "active" && <button type="button" disabled={busy === key} onClick={() => act(r, "active", r.role === "poster" ? "member" : "poster")} className={small}>{r.role === "poster" ? "ביטול הרשאת פרסום" : "הרשאת פרסום"}</button>}
        </li>;
      })}
    </ul>
  </section>;
}
