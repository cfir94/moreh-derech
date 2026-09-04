"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UNIT_PROMPTS, promptById } from "@/data/guide-reports/practice-prompts";
import { analyzeFiveMs } from "@/lib/fiveMs";
import { saveDraft } from "@/lib/guideReportDrafts";

export function UnitPractice({ initialPromptId }: { initialPromptId?: string }) {
  const [promptId, setPromptId] = useState(
    initialPromptId && promptById(initialPromptId)
      ? initialPromptId
      : UNIT_PROMPTS[0].id,
  );
  const [site, setSite] = useState(() => promptById(promptId)?.site ?? "");
  const [duration, setDuration] = useState(
    () => promptById(promptId)?.duration ?? "20 דק׳",
  );
  const [methods, setMethods] = useState("");
  const [body, setBody] = useState("");
  const [draftId, setDraftId] = useState<string | undefined>();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const prompt = promptById(promptId);

  const feedback = useMemo(() => analyzeFiveMs(body), [body]);

  function onPickPrompt(id: string) {
    setPromptId(id);
    const p = promptById(id);
    if (p) {
      setSite(p.site);
      setDuration(p.duration);
    }
    setShowFeedback(false);
  }

  function onSave() {
    const d = saveDraft({
      id: draftId,
      kind: "unit",
      title: site || "יחידת הדרכה",
      payload: { promptId, site, duration, methods, body },
    });
    setDraftId(d.id);
    setSavedMsg("הטיוטה נשמרה במכשיר זה");
    setTimeout(() => setSavedMsg(null), 2500);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1.5 block text-[12px] font-extrabold text-txt-dim">
          בחרו תרחיש תרגול
        </label>
        <select
          value={promptId}
          onChange={(e) => onPickPrompt(e.target.value)}
          className="w-full rounded-md border border-line bg-card-2 px-3 py-2.5 text-sm font-bold"
        >
          {UNIT_PROMPTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.site}
            </option>
          ))}
        </select>
        {prompt && (
          <p className="mt-2 text-[13px] leading-relaxed text-txt-dim">
            <b className="text-txt">מיקוד: </b>
            {prompt.focus}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">
            האתר
          </label>
          <input
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">
            משך ההדרכה
          </label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">
          יחידת ההדרכה (עד ~180 מילים) — שלבו את חמש המ״מים
        </label>
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setShowFeedback(false);
          }}
          rows={10}
          placeholder="כתבו כאילו אתם מדברים אל הקבוצה בשטח…"
          className="w-full rounded-md border border-line bg-card px-3 py-3 text-[13.5px] leading-relaxed"
        />
        <p className="mt-1 text-[11px] text-txt-dim">
          <span className="num">{feedback.wordCount}</span> מילים
        </p>
      </div>

      <div>
        <label className="mb-1 block text-[12px] font-extrabold text-txt-dim">
          אמצעים מתודיים
        </label>
        <input
          value={methods}
          onChange={(e) => setMethods(e.target.value)}
          placeholder="עזר, מפה, תנ״ך, הצבעה בשטח…"
          className="w-full rounded-md border border-line bg-card px-3 py-2.5 text-sm"
        />
      </div>

      {prompt && (
        <div className="rounded-md border border-dashed border-line bg-card-2/40 px-3 py-2.5 text-[12.5px] text-txt-dim">
          <p className="mb-1 font-extrabold text-txt">רמזים (לא חובה)</p>
          <ul className="list-inside list-disc space-y-0.5">
            {prompt.hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowFeedback(true)}
          className="rounded-full px-5 py-3 text-sm font-extrabold text-on-accent transition active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)",
            boxShadow: "0 10px 26px -10px var(--teal)",
          }}
        >
          בדיקת חמש המ״מים
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-full border border-line bg-card-2 px-5 py-3 text-sm font-extrabold transition active:scale-95"
        >
          שמירת טיוטה
        </button>
        <Link
          href="/guide-reports/drafts"
          className="rounded-full border border-line bg-card px-5 py-3 text-sm font-extrabold text-txt-dim transition active:scale-95"
        >
          כל הטיוטות
        </Link>
      </div>

      {savedMsg && (
        <p className="text-sm font-bold text-ok">{savedMsg}</p>
      )}

      {showFeedback && (
        <div className="rounded-lg border border-line bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="text-base">משוב מ״מים</h3>
            <span className="num text-sm font-extrabold text-mc">
              {feedback.score}/100
            </span>
          </div>
          {feedback.lengthNote && (
            <p className="mb-3 text-[13px] text-txt-dim">{feedback.lengthNote}</p>
          )}
          <ul className="flex flex-col gap-2">
            {feedback.results.map((r) => (
              <li
                key={r.key}
                className="flex gap-2 rounded-md border border-line bg-card-2/50 px-3 py-2 text-[13px]"
              >
                <span aria-hidden className="text-lg leading-none">
                  {r.found ? "✓" : "○"}
                </span>
                <span>
                  <b className={r.found ? "text-ok" : "text-txt"}>{r.label}</b>
                  {" — "}
                  <span className="text-txt-dim">{r.note}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-txt-dim">
            זה משוב אוטומטי לפי מילות מפתח — לא ציון של בוחן. השתמשו בו כדי
            לוודא שכיסיתם את חמש המ״מים, ואז ערכו לפי שיקול דעת.
          </p>
        </div>
      )}
    </div>
  );
}
