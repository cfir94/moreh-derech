import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_DOCS } from "@/data/legal";
import { kit, PenUnderline } from "@/components/trail/kit";
import { PageDecor } from "@/components/trail/PageDecor";

export const metadata: Metadata = { title: "מסמכים" };

export default function LegalIndex() {
  return (
    <div className="screen-in relative mx-auto max-w-2xl px-4 py-10">
      <PageDecor prints={false} items={["scroll", "pencil", "notebooks"]} />
      <div className={`${kit.titleWrap} mb-6`}>
        <h1 className="grad-text text-3xl">מסמכים</h1>
        <PenUnderline />
      </div>
      <ul className="flex flex-col gap-3">
        {LEGAL_DOCS.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/legal/${doc.slug}/`} className="block paper-sheet p-4 font-bold text-txt hover:border-teal">
              {doc.title}
              <span className="mt-1 block text-sm font-normal text-txt-dim">{doc.intro}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
