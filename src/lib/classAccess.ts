/**
 * Course recordings — lectures, online units and tour footage — belong to the lecturers and
 * the class. They stay open to the people who were in the course when the site went commercial,
 * meaning every account created before this moment, and are hidden from everyone who joins later.
 * New users see only the enrichment library.
 *
 * This is a static site, so this hides the recordings in the interface; the playlist IDs still
 * ship in the bundle. Real enforcement needs a Supabase table read under RLS (see PLAN.md).
 */
export const CLASS_MEMBER_CUTOFF = "2026-11-07T00:00:00+02:00";

export function isClassMember(createdAt: string | undefined | null): boolean {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  return Number.isFinite(created) && created < Date.parse(CLASS_MEMBER_CUTOFF);
}
