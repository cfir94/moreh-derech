import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { TERMS } from "@/data/legal";

export const metadata: Metadata = { title: `${TERMS.title} — אבן דרך למורי דרך` };

export default function Page() {
  return <LegalPage doc={TERMS} />;
}
