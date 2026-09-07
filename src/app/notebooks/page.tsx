/**
 * עיצוב "ארון מסע": המחברות מאורגנות לפי אופן למידה ואזור, בשפה השקטה של אבן דרך.
 * זהו עמוד אינדקס בלבד: הקישורים פותחים את המחברות המקוריות בלשונית חדשה.
 */
import { NotebookLibrary } from "@/components/notebooks/NotebookLibrary";

export const metadata = {
  title: "מחברות הקורס",
};

export default function NotebooksPage() {
  return <NotebookLibrary />;
}
