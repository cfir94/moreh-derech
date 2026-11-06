import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { PRIVACY } from "@/data/legal";

export const metadata: Metadata = { title: `${PRIVACY.title} — אבן דרך למורי דרך` };

export default function Page() {
  return <LegalPage doc={PRIVACY} />;
}
