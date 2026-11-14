import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { fontVariables } from "./fonts";
import { CloudSync } from "@/components/CloudSync";
import { MotiButton } from "@/components/MotiButton";
import { Navbar } from "@/components/Navbar";
import { PaywallGate } from "@/components/paywall/PaywallGate";
import { SiteFooter } from "@/components/SiteFooter";
import { PreviewBar } from "@/components/PreviewBar";
import { UserProvider } from "@/contexts/UserContext";
import { InkDefs } from "@/components/trail/Ink";
import { withBasePath } from "@/lib/basePath";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "he_IL",
    type: "website",
    siteName: SITE_NAME,
    images: [absoluteUrl("/marketing/og.jpg")],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl("/marketing/og.jpg")],
  },
};

const themeInitScript = `
  try {
    const saved = localStorage.getItem("even-derech-theme");
    document.documentElement.dataset.theme = saved === "light" ? "light" : "dark";
  } catch (_) {
    document.documentElement.dataset.theme = "dark";
  }
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans" style={{ "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties}>
        <InkDefs />
        <UserProvider>
          <PreviewBar />
          <Navbar />
          <main className="flex-1 pb-20 sm:pb-0">
            <PaywallGate>{children}</PaywallGate>
          </main>
          <SiteFooter />
          <MotiButton />
          <CloudSync />
        </UserProvider>
      </body>
    </html>
  );
}
