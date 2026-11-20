import type { Metadata } from "next";

import { SITE_URL } from "@/lib/launch";

export { SITE_URL };
export const SITE_NAME = "אבן דרך למורי דרך";
export const DEFAULT_DESCRIPTION =
  "כל מה שמורה דרך צריך, מהמבחן ועד הסיור הבא: אלפי שאלות לפי נושאי הסילבוס, מבחני רישוי מלאים, צירי זמן ומפות למידה, ומפה לתכנון מסלולים בשטח.";

// SITE_URL may carry a base path (GitHub Pages: /moreh-derech), which
// `new URL(path, base)` would drop — so join, and keep trailingSlash: true.
export function absoluteUrl(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const isFile = /\.[a-z0-9]+$/i.test(clean);
  return `${SITE_URL.replace(/\/+$/, "")}/${clean}${clean && !isFile ? "/" : ""}`;
}

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "he_IL",
      type: "website",
      siteName: SITE_NAME,
      images: [absoluteUrl("/marketing/og-2026.jpg")],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/marketing/og-2026.jpg")],
    },
  };
}
