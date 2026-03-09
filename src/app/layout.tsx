import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Back to the Basics Movement — Guarded · Grounded · Grateful",
  description:
    "Restoring clarity in a distracted world. A movement built on guarded minds, grounded lives, and grateful hearts.",
  keywords: [
    "Back to the Basics",
    "personal development",
    "discipline",
    "clarity",
    "movement",
  ],
  openGraph: {
    title: "Back to the Basics Movement",
    description: "Restoring clarity in a distracted world.",
    url: "https://backtothebasicsmovement.com",
    siteName: "Back to the Basics Movement",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
