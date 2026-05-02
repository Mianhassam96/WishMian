import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WishMian — Send a Magical Cinematic Wish",
  description:
    "Create a magical animated wish link. No signup. No backend. Pure cinematic shock reveal experience.",
  keywords: ["birthday wish", "eid mubarak", "wedding wishes", "animated greeting", "wish link"],
  authors: [{ name: "Mianhassam96" }],
  // Next.js automatically serves app/icon.png and app/apple-icon.png
  // with the correct basePath — no manual href needed
  manifest: "/manifest.json",
  openGraph: {
    title: "WishMian — Magical Wish Links",
    description: "Someone sent you a cinematic surprise. Tap to open.",
    type: "website",
    siteName: "WishMian",
  },
  twitter: {
    card: "summary",
    title: "WishMian — Magical Wish Links",
    description: "Someone sent you a cinematic surprise. Tap to open.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#060010" />
      </head>
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
