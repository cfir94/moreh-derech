import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_DOCS } from "@/data/legal";

export const metadata: Metadata = { title: "מסמכים — אבן דרך למורי דרך" };

export default function LegalIndex() {
  return (
    <div className="screen-in mx-auto max-w-2xl px-4 py-10">
      <h1 className="grad-text mb-6 text-3xl">מסמכים</h1>
      <ul className="flex flex-col gap-3">
        {LEGAL_DOCS.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/legal/${doc.slug}/`} className="block rounded-lg border border-line bg-card p-4 font-bold text-txt hover:border-teal">
              {doc.title}
              <span className="mt-1 block text-sm font-normal text-txt-dim">{doc.intro}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
