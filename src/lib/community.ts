/*
 * קהילה (C-10..C-12): פורום מחזור ולוח פרסומים. כל ההרשאות נאכפות ב-Supabase
 * (supabase/migrations/20261110_01_community.sql); כאן רק הקריאות.
 * הודעות מופיעות מיד, והמנהל מסתיר בדיעבד (החלטת הבעלים, 10.11).
 */
import { authenticatedSupabaseRequest, readSession } from "@/lib/cloudAuth";

export type Forum = {
  id: number; slug: string; title: string; description: string; kind: "forum" | "board";
  member: boolean; can_open: boolean; request: "pending" | "active" | "banned" | null;
  unread: number; last_activity: string | null;
};
export type Thread = {
  id: number; forum_id: number; author_id: string; author_name: string; title: string; body: string;
  pinned: boolean; hidden: boolean; post_count: number; last_post_at: string; created_at: string;
};
export type Post = { id: number; thread_id: number; author_id: string; author_name: string; body: string; hidden: boolean; created_at: string };
export type MemberRequest = {
  forum_id: number; forum_title: string; user_id: string; email: string; full_name: string;
  status: "pending" | "active" | "banned"; role: "member" | "poster"; created_at: string;
};

const rpc = <T,>(name: string, body: Record<string, unknown> = {}) =>
  authenticatedSupabaseRequest<T>(`/rest/v1/rpc/${name}`, { method: "POST", body });

export const COMMUNITY_EVENT = "md-community-changed";

/** הפורומים, עם חברות וספירת "לא נקרא". בלי התחברות: רשימה ריקה. */
export async function myForums(): Promise<Forum[]> {
  if (!readSession()) return [];
  const rows = await rpc<Forum[]>("md_my_forums");
  return Array.isArray(rows) ? rows : [];
}

export async function totalUnread(): Promise<number> {
  const forums = await myForums().catch(() => []);
  return forums.reduce((sum, f) => sum + (f.member ? f.unread : 0), 0);
}

export async function threads(forumId: number): Promise<Thread[]> {
  const rows = await authenticatedSupabaseRequest<Thread[]>(
    `/rest/v1/md_threads?forum_id=eq.${forumId}&select=*&order=pinned.desc,last_post_at.desc&limit=200`,
  );
  return Array.isArray(rows) ? rows : [];
}

export async function thread(threadId: number): Promise<{ thread: Thread | null; posts: Post[] }> {
  const [t, p] = await Promise.all([
    authenticatedSupabaseRequest<Thread[]>(`/rest/v1/md_threads?id=eq.${threadId}&select=*`),
    authenticatedSupabaseRequest<Post[]>(`/rest/v1/md_posts?thread_id=eq.${threadId}&select=*&order=created_at.asc&limit=1000`),
  ]);
  return { thread: Array.isArray(t) && t[0] ? t[0] : null, posts: Array.isArray(p) ? p : [] };
}

export async function openThread(forumId: number, title: string, body: string): Promise<Thread> {
  const rows = await authenticatedSupabaseRequest<Thread[]>("/rest/v1/md_threads", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: { forum_id: forumId, title: title.trim(), body: body.trim() },
  });
  notify();
  return rows[0];
}

export async function reply(threadId: number, body: string): Promise<Post> {
  const rows = await authenticatedSupabaseRequest<Post[]>("/rest/v1/md_posts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: { thread_id: threadId, body: body.trim() },
  });
  notify();
  return rows[0];
}

/** "קראתי": מאפס את מונה הלא-נקרא של הפורום. */
export async function markRead(forumId: number) {
  const session = readSession();
  if (!session) return;
  await authenticatedSupabaseRequest("/rest/v1/md_forum_reads?on_conflict=user_id,forum_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: { user_id: session.user_id, forum_id: forumId, last_read_at: new Date().toISOString() },
  }).catch(() => null);
  notify();
}

export async function requestJoin(forumId: number) {
  const session = readSession();
  if (!session) throw new Error("צריך להתחבר");
  await authenticatedSupabaseRequest("/rest/v1/md_forum_members", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: { forum_id: forumId, user_id: session.user_id, status: "pending", role: "member" },
  });
}

// --- מנהל ---
export const adminHide = (kind: "thread" | "post", id: number, hidden: boolean) =>
  rpc<void>("md_admin_forum_hide", { p_kind: kind, p_id: id, p_hidden: hidden });
export const adminPin = (threadId: number, pinned: boolean) => rpc<void>("md_admin_forum_pin", { p_thread: threadId, p_pinned: pinned });
export const adminSetMember = (forumId: number, userId: string, status: "active" | "banned", role: "member" | "poster" = "member") =>
  rpc<void>("md_admin_forum_member", { p_forum: forumId, p_user: userId, p_status: status, p_role: role });
export const adminRequests = () => rpc<MemberRequest[]>("md_admin_forum_requests");

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(COMMUNITY_EVENT));
}
