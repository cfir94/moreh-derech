import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "עיצוב חדש — השוואה",
  robots: { index: false, follow: false },
};

/** Not linked from the site: the owner opens it from the PR to compare the two versions. */
export default function Page() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-black">גרסאות לדף הבית החדש</h1>
      <p className="mb-8 text-lg text-txt-dim">
        שתיהן נפתחות במפה שיוצאת מהתרמיל. ההבדל הוא שפת הניווט והאייקונים. בגרסאות האלה הפתיחה מוצגת בכל
        כניסה; באתר עצמו היא תוצג רק בכניסה הראשונה.
      </p>
      <ul className="flex flex-col gap-3">
        <li>
          <Link href="/design/map" className="block rounded-lg border border-line bg-card px-5 py-4 text-xl font-bold">
            גרסה ה׳: צבע מפה (הכי חדש)
          </Link>
          <Link href="/design/map/quiz" className="mt-1 block px-5 py-2 text-lg font-bold text-teal">
            מסך שאלה בגרסה ה׳
          </Link>
        </li>
        <li>
          <Link href="/design/khaki" className="block rounded-lg border border-line bg-card px-5 py-4 text-xl font-bold">
            גרסה ג׳: חול וחאקי
          </Link>
          <Link href="/design/khaki/quiz" className="mt-1 block px-5 py-2 text-lg font-bold text-teal">
            מסך שאלה בגרסה ג׳
          </Link>
        </li>
        <li>
          <Link href="/design/journey" className="block rounded-lg border border-line bg-card px-5 py-4 text-xl font-bold">
            גרסה ד׳: מהכרמל לנגב
          </Link>
          <Link href="/design/journey/quiz" className="mt-1 block px-5 py-2 text-lg font-bold text-teal">
            מסך שאלה בגרסה ד׳
          </Link>
        </li>
        <li>
          <Link href="/design/signs" className="block rounded-lg border border-line bg-card px-5 py-4 text-xl font-bold">
            גרסה א׳: השלטים החומים
          </Link>
          <Link href="/design/signs/quiz" className="mt-1 block px-5 py-2 text-lg font-bold text-teal">
            מסך שאלה בגרסה א׳
          </Link>
        </li>
        <li>
          <Link href="/design/trails" className="block rounded-lg border border-line bg-card px-5 py-4 text-xl font-bold">
            גרסה ב׳: סימון שבילים
          </Link>
          <Link href="/design/trails/quiz" className="mt-1 block px-5 py-2 text-lg font-bold text-teal">
            מסך שאלה בגרסה ב׳
          </Link>
        </li>
      </ul>
    </div>
  );
}
