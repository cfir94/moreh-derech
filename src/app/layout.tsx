import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { UserProvider } from "@/contexts/UserContext";
import "./globals.css";

// Heebo across the board, as the geo-game uses it — its 900 weight is what
// makes the headings read as a game rather than a document.
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "אֶבֶן דֶּרֶךְ למורי דרך",
  description: "אֶבֶן דֶּרֶךְ למורי דרך — תרגול, שאלונים, צירי זמן ומפת מורשת",
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
      className={`${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <UserProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
