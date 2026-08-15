import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { UserProvider } from "@/contexts/UserContext";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "מורי דרך",
  description: "המערכת המרכזית לתלמידי קורס מורי דרך",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <UserProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
