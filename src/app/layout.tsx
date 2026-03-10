import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Back to the Basics Movement | Guarded · Grounded · Grateful",
  description:
    "A personal development and education movement rooted in discipline, truth, gratitude, and shared testimony. Restoring clarity in a distracted world.",
  openGraph: {
    title: "Back to the Basics Movement",
    description:
      "Guarded · Grounded · Grateful — Restoring clarity in a distracted world.",
    images: ["/images/hero-logo.jpg"],
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
      <head>
        <link rel="icon" type="image/jpeg" href="/images/hero-logo.jpg" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
