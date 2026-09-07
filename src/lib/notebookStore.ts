/**
 * שכבת האחסון של מחברות שנוספו דרך ממשק הניהול.
 * המחברות המובנות נשארות בקוד; הרשומות כאן מצטרפות אליהן בזמן טעינת העמוד.
 */
import {
  authenticatedSupabaseRequest,
  readSession,
  supabaseRequest,
} from "@/lib/cloudAuth";

export type StoredNotebookMode = "tours" | "theory" | "online";

export type StoredNotebook = {
  id: number;
  mode: StoredNotebookMode;
  subcategory: string;
  title: string;
  date: string;
  guide: string;
  places: string;
  url: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type StoredNotebookDraft = Pick<
  StoredNotebook,
  "mode" | "subcategory" | "title" | "date" | "guide" | "places" | "url"
>;

const SELECT_FIELDS =
  "id,mode,subcategory,title,date,guide,places,url,owner_id,created_at,updated_at";

export async function listStoredNotebooks() {
  return supabaseRequest<StoredNotebook[]>(
    `/rest/v1/course_notebooks?select=${SELECT_FIELDS}&order=created_at.asc`,
    { auth: false },
  );
}

export async function createStoredNotebook(draft: StoredNotebookDraft) {
  const session = readSession();
  if (!session) throw new Error("יש להתחבר לפני הוספת מחברת.");
  const rows = await authenticatedSupabaseRequest<StoredNotebook[]>(
    "/rest/v1/course_notebooks",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: [{ ...draft, owner_id: session.user_id }],
    },
  );
  if (!rows[0]) throw new Error("המחברת לא נשמרה.");
  return rows[0];
}

export async function updateStoredNotebook(
  id: number,
  draft: StoredNotebookDraft,
) {
  const rows = await authenticatedSupabaseRequest<StoredNotebook[]>(
    `/rest/v1/course_notebooks?id=eq.${id}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: { ...draft, updated_at: new Date().toISOString() },
    },
  );
  if (!rows[0]) throw new Error("המחברת לא עודכנה.");
  return rows[0];
}

export async function deleteStoredNotebook(id: number) {
  await authenticatedSupabaseRequest(
    `/rest/v1/course_notebooks?id=eq.${id}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    },
  );
}

export function displayNotebookDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}
