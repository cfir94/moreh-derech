"use client";

/**
 * ממשק נוחות אישי בסגנון "ארון מסע": טופס קומפקטי וברור שממשיך את שפת
 * המשטחים הכהים, מסגרות האבן והטורקיז של ספריית המחברות הציבורית.
 */
import { useState, type FormEvent } from "react";
import {
  NOTEBOOK_MODES,
  THEORY_SUBJECTS,
  TOUR_REGIONS,
} from "@/data/notebooks";
import {
  createStoredNotebook,
  deleteStoredNotebook,
  updateStoredNotebook,
  type StoredNotebook,
  type StoredNotebookDraft,
  type StoredNotebookMode,
} from "@/lib/notebookStore";

type Props = {
  notebooks: StoredNotebook[];
  dataError: string;
  onCreated: (notebook: StoredNotebook) => void;
  onUpdated: (notebook: StoredNotebook) => void;
  onDeleted: (id: number) => void;
};

const EMPTY_FORM: StoredNotebookDraft = {
  mode: "tours",
  subcategory: TOUR_REGIONS[0].id,
  title: "",
  date: "",
  guide: "",
  places: "",
  url: "",
};

function optionsForMode(mode: StoredNotebookMode) {
  if (mode === "tours") {
    return TOUR_REGIONS.map((region) => ({ value: region.id, label: region.title }));
  }
  if (mode === "theory") {
    return THEORY_SUBJECTS.map((subject) => ({ value: subject.id, label: subject.title }));
  }
  return [{ value: "online", label: "שיעורים מקוונים" }];
}

function normalizeNotebookUrl(value: string) {
  const url = new URL(value.trim());
  if (url.protocol !== "https:" || url.hostname !== "notebook.google.com") {
    throw new Error("יש להזין קישור תקין של Gemini Notebook.");
  }
  return url.toString();
}

export function NotebookManager({
  notebooks,
  dataError,
  onCreated,
  onUpdated,
  onDeleted,
}: Props) {
  const [draft, setDraft] = useState<StoredNotebookDraft>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const subcategoryOptions = optionsForMode(draft.mode);

  const updateField = <K extends keyof StoredNotebookDraft>(
    field: K,
    value: StoredNotebookDraft[K],
  ) => setDraft((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setDraft(EMPTY_FORM);
    setEditingId(null);
    setError("");
  };

  const handleModeChange = (mode: StoredNotebookMode) => {
    const firstOption = optionsForMode(mode)[0].value;
    setDraft((current) => ({ ...current, mode, subcategory: firstOption }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const cleanDraft = {
        ...draft,
        title: draft.title.trim(),
        guide: draft.guide.trim(),
        places: draft.places.trim(),
        url: normalizeNotebookUrl(draft.url),
      };
      if (editingId === null) {
        const created = await createStoredNotebook(cleanDraft);
        onCreated(created);
        setMessage("המחברת נוספה לספרייה.");
      } else {
        const updated = await updateStoredNotebook(editingId, cleanDraft);
        onUpdated(updated);
        setMessage("המחברת עודכנה.");
      }
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "שמירת המחברת נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const startEditing = (notebook: StoredNotebook) => {
    setEditingId(notebook.id);
    setDraft({
      mode: notebook.mode,
      subcategory: notebook.subcategory,
      title: notebook.title,
      date: notebook.date,
      guide: notebook.guide,
      places: notebook.places,
      url: notebook.url,
    });
    setMessage("");
    setError("");
  };

  const removeNotebook = async (notebook: StoredNotebook) => {
    if (!window.confirm(`למחוק את המחברת „${notebook.title}”?`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await deleteStoredNotebook(notebook.id);
      onDeleted(notebook.id);
      if (editingId === notebook.id) resetForm();
      setMessage("המחברת נמחקה.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "מחיקת המחברת נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-8 overflow-hidden rounded-[var(--r-lg)] border border-teal/30 bg-card" aria-labelledby="notebook-manager-title">
      <div className="border-b border-line bg-teal/5 px-5 py-4 sm:px-6">
        <p className="mb-1 text-xs font-extrabold tracking-wide text-teal">כלי אישי ל־Cfir94</p>
        <h2 id="notebook-manager-title" className="text-xl text-txt sm:text-2xl">ניהול מחברות</h2>
        <p className="mt-1 text-sm leading-relaxed text-txt-dim">ממלאים את הפרטים ושומרים. המחברת מצטרפת מיד לקטגוריה שבחרת.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <label className="flex flex-col gap-1.5 text-sm font-bold text-txt">
          קטגוריה
          <select
            value={draft.mode}
            onChange={(event) => handleModeChange(event.target.value as StoredNotebookMode)}
            className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base font-normal outline-none transition focus:border-teal"
          >
            {NOTEBOOK_MODES.map((mode) => <option key={mode.id} value={mode.id}>{mode.title}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold text-txt">
          {draft.mode === "tours" ? "אזור" : draft.mode === "theory" ? "תחום לימוד" : "סוג מפגש"}
          <select
            value={draft.subcategory}
            onChange={(event) => updateField("subcategory", event.target.value)}
            className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base font-normal outline-none transition focus:border-teal"
          >
            {subcategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold text-txt sm:col-span-2">
          שם המחברת
          <input
            required
            value={draft.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base font-normal outline-none transition focus:border-teal"
            placeholder="למשל: ירושלים בתקופה הרומית"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold text-txt sm:col-span-2">
          קישור ל־Gemini Notebook
          <input
            required
            type="url"
            dir="ltr"
            value={draft.url}
            onChange={(event) => updateField("url", event.target.value)}
            className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base font-normal outline-none transition focus:border-teal"
            placeholder="https://notebook.google.com/notebook/..."
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold text-txt">
          תאריך
          <input
            required
            type="date"
            value={draft.date}
            onChange={(event) => updateField("date", event.target.value)}
            className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base font-normal outline-none transition focus:border-teal"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold text-txt">
          שם המדריך או המרצה
          <input
            required
            value={draft.guide}
            onChange={(event) => updateField("guide", event.target.value)}
            className="rounded-md border border-line bg-sheet px-3.5 py-3 text-base font-normal outline-none transition focus:border-teal"
            placeholder="שם המדריך"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold text-txt sm:col-span-2">
          אתרים, מוקדים או תיאור קצר
          <textarea
            required
            rows={3}
            value={draft.places}
            onChange={(event) => updateField("places", event.target.value)}
            className="resize-y rounded-md border border-line bg-sheet px-3.5 py-3 text-base font-normal outline-none transition focus:border-teal"
            placeholder="הפרידו בין אתרים באמצעות נקודה אמצעית או פסיק"
          />
        </label>

        {(error || dataError) && <p role="alert" className="rounded-md border border-red/35 bg-red/10 px-3.5 py-3 text-sm font-bold text-red sm:col-span-2">{error || dataError}</p>}
        {message && <p role="status" className="rounded-md border border-teal/35 bg-teal/10 px-3.5 py-3 text-sm font-bold text-teal sm:col-span-2">{message}</p>}

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" disabled={busy} className="rounded-full bg-teal px-5 py-3 text-sm font-extrabold text-bg transition hover:brightness-110 active:scale-[0.97] disabled:cursor-wait disabled:opacity-60">
            {busy ? "שומר…" : editingId === null ? "הוספת מחברת" : "שמירת השינויים"}
          </button>
          {editingId !== null && <button type="button" onClick={resetForm} className="rounded-full border border-line bg-card-2 px-5 py-3 text-sm font-bold text-txt-dim transition hover:text-txt active:scale-[0.97]">ביטול עריכה</button>}
        </div>
      </form>

      {notebooks.length > 0 && (
        <div className="border-t border-line px-5 py-5 sm:px-6">
          <h3 className="mb-3 text-base text-txt">מחברות שנוספו מהממשק</h3>
          <div className="grid gap-2">
            {notebooks.map((notebook) => (
              <div key={notebook.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-sheet px-4 py-3">
                <div>
                  <p className="font-bold text-txt">{notebook.title}</p>
                  <p className="mt-0.5 text-xs text-txt-dim">{NOTEBOOK_MODES.find((mode) => mode.id === notebook.mode)?.title} · {notebook.date}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEditing(notebook)} disabled={busy} className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-txt-dim transition hover:border-teal/40 hover:text-teal">עריכה</button>
                  <button type="button" onClick={() => void removeNotebook(notebook)} disabled={busy} className="rounded-full border border-red/30 px-3 py-1.5 text-xs font-bold text-red transition hover:bg-red/10">מחיקה</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
