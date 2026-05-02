import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WishMian — Send a Magical Cinematic Wish",
  description:
    "Create a magical animated wish link. No signup. No backend. Pure cinematic shock reveal experience.",
  openGraph: {
    title: "WishMian — Magical Wish Links",
    description: "Someone sent you a cinematic surprise. Tap to open.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
