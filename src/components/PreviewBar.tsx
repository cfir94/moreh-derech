"use client";

/** פס עליון בתצוגה מקדימה של ההשקה: מה מוצג, החלפת מצב מדומה, ויציאה. */
import { useEffect } from "react";
import { applyPreviewFromUrl, setPreview, usePreview, type PreviewAs } from "@/lib/launchClient";

const LABELS: [PreviewAs, string][] = [
  ["real", "המצב האמיתי שלי"],
  ["guest", "אורח"],
  ["none", "מחובר, לפני ניסיון"],
  ["trial", "בשבוע ניסיון"],
  ["expired", "ניסיון נגמר"],
  ["paid", "מנוי"],
];

export function PreviewBar() {
  const preview = usePreview();
  useEffect(() => applyPreviewFromUrl(), []);
  if (!preview.on) return null;
  return (
    <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-center gap-2 border-b border-gold/40 bg-card px-3 py-2 text-sm">
      <span className="font-bold text-gold">תצוגה מקדימה של ההשקה (רק בדפדפן הזה):</span>
      <label className="flex items-center gap-1">
        מצב:
        <select
          value={preview.as}
          onChange={(e) => setPreview({ on: true, as: e.target.value as PreviewAs })}
          className="rounded border border-line bg-sheet px-2 py-1 text-txt"
        >
          {LABELS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => setPreview({ on: false, as: "real" })} className="rounded-full border border-line px-3 py-1 font-bold text-txt">
        יציאה מהתצוגה
      </button>
    </div>
  );
}
