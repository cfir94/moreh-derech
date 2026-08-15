import { embedUrl } from "@/lib/basePath";

export default function MapPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">מפה אינטראקטיבית</h1>
      <p className="mb-6 text-neutral-600">
        מפת מורשת ישראל — מפה וקטורית עצמאית בחלוקה לשכבות (אזורים, גיאולוגיה,
        ציר זמן היסטורי, אתרי דת, שמורות וגנים, חי וצומח), עם בניית מסלול
        סיור וחיפוש. עובדת גם אופליין לאחר טעינה ראשונה.
      </p>

      <a
        href={embedUrl("map/")}
        className="inline-block rounded-md bg-neutral-900 px-5 py-2.5 font-medium text-white transition hover:bg-neutral-700"
      >
        פתיחת המפה
      </a>
    </div>
  );
}
