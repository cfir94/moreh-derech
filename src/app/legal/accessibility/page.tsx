import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ACCESSIBILITY } from "@/data/legal";

export const metadata: Metadata = { title: `${ACCESSIBILITY.title}` };

export default function Page() {
  return <LegalPage doc={ACCESSIBILITY} />;
}
