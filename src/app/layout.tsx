import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { fontVariables } from "./fonts";
import { CloudSync } from "@/components/CloudSync";
import { MotiButton } from "@/components/MotiButton";
import { Navbar } from "@/components/Navbar";
import { SectionGround } from "@/components/SectionGround";
import { PaywallGate } from "@/components/paywall/PaywallGate";
import { SiteFooter } from "@/components/SiteFooter";
import { PreviewBar } from "@/components/PreviewBar";
import { UserProvider } from "@/contexts/UserContext";
import { InkDefs } from "@/components/trail/Ink";
import { withBasePath } from "@/lib/basePath";
import { LAUNCH } from "@/lib/launch";
import { SESSION_KEY } from "@/lib/cloudAuth";
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
    images: [absoluteUrl("/marketing/og-2026.jpg")],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl("/marketing/og-2026.jpg")],
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
        {/* a guest on the home page goes to the landing page before anything is drawn (no flash of the backpack) */}
        {LAUNCH.paywall && (
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var b=${JSON.stringify(withBasePath(""))};var p=location.pathname.replace(/\/$/,"");if(p===b&&!localStorage.getItem(${JSON.stringify(SESSION_KEY)}))location.replace(b+"/welcome/"+location.search)}catch(e){}`,
            }}
          />
        )}
      </head>
      <body className="flex min-h-full flex-col font-sans" style={{ "--topo": `url(${withBasePath("/design/jerusalem-topo.svg")})` } as React.CSSProperties}>
        <InkDefs />
        <SectionGround />
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
