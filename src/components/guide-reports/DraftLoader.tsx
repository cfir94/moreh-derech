"use client";

import { Fragment, Suspense, useSyncExternalStore, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { AUTH_EVENT } from "@/lib/cloudAuth";
import { useHydrated } from "@/lib/clientStore";
import { DRAFTS_EVENT, readDrafts, draftKind, draftHref, validDraftPayload,
  type DraftKind, type GuideDraft, type DayDraftPayload, type UnitDraftPayload, type ExamDraftPayload } from "@/lib/guideReportDrafts";
import { scenarioById } from "@/data/guide-reports/scenarios";
import { promptById } from "@/data/guide-reports/practice-prompts";
import { EXAM_PAPERS } from "@/data/guide-reports/exam-briefs";

const EMPTY: GuideDraft[] = [];
function subscribe(changed: () => void) {
  const events = [DRAFTS_EVENT, AUTH_EVENT, "storage"];
  events.forEach((event) => window.addEventListener(event, changed));
  return () => events.forEach((event) => window.removeEventListener(event, changed));
}

type Props = { kind: DraftKind; children: (draft?: GuideDraft) => ReactNode };
const Loading = () => <p className="py-6 text-sm text-txt-dim">טוען טיוטה…</p>;

function LoadedDraft({ kind, children }: Props) {
  const params = useSearchParams();
  const id = params.get("draft");
  const drafts = useSyncExternalStore(subscribe, readDrafts, () => EMPTY);
  const hydrated = useHydrated();
  const { user, ready } = useUser();
  if (!hydrated || !ready) return <Loading />;
  const draft = id ? drafts.find((item) => item.id === id) : undefined;
  let error = "";
  if (id && !draft) error = "הטיוטה לא נמצאה בחשבון ובמכשיר הנוכחיים.";
  else if (draft && !validDraftPayload(draft)) error = "לא ניתן לפתוח את הטיוטה: הנתונים השמורים אינם תקינים. הטיוטה לא שונתה.";
  else if (draft && draftKind(draft) !== kind) {
    return <Link href={draftHref(draft)} className="font-bold text-teal hover:underline">לפתיחת הטיוטה במסך המתאים ←</Link>;
  } else if (draft) {
    const valid = kind === "day" ? !!scenarioById((draft.payload as DayDraftPayload).scenarioId)
      : kind === "unit" ? !!promptById((draft.payload as UnitDraftPayload).promptId)
      : EXAM_PAPERS.some((paper) => paper.slug === (draft.payload as ExamDraftPayload).paperSlug && paper.groups.some((group) => group.n === (draft.payload as ExamDraftPayload).groupN && group.shortUnits.length === (draft.payload as ExamDraftPayload).units.length));
    if (!valid) error = "התרחיש של הטיוטה אינו זמין כרגע. התוכן השמור לא שונה.";
  }
  if (error) return <div role="status" className="rounded-lg border border-line bg-card p-5"><p className="mb-3 text-txt-dim">{error}</p><Link href="/guide-reports/drafts" className="font-bold text-teal">לרשימת הטיוטות</Link></div>;
  return <Fragment key={`${user?.id ?? "guest"}:${id ?? "new"}`}>{children(draft)}</Fragment>;
}

/** Suspense is required for URL parameters in the static Pages export. */
export function DraftLoader(props: Props) {
  return <Suspense fallback={<Loading />}><LoadedDraft {...props} /></Suspense>;
}
