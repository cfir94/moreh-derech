import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CANCELLATION } from "@/data/legal";

export const metadata: Metadata = { title: `${CANCELLATION.title} — אבן דרך למורי דרך` };

export default function Page() {
  return <LegalPage doc={CANCELLATION} />;
}
