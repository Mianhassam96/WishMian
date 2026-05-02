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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
  themeColor: "#05050a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#05050a" />
      </head>
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
