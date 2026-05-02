import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WishMian — Cinematic Celebration Experiences",
  description:
    "Turn moments into memories people feel. Create unforgettable cinematic celebration pages with shock reveal, emotional animations, and viral sharing.",
  keywords: [
    "birthday wishes",
    "wedding celebration",
    "eid greetings",
    "cinematic experience",
    "emotional moments",
  ],
  openGraph: {
    title: "WishMian — Cinematic Celebration Experiences",
    description: "Turn moments into memories people feel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise`}
      >
        {children}
      </body>
    </html>
  );
}
