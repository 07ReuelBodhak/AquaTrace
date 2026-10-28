import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AquaTrace — Waterborne Outbreak Investigation & Prioritisation Platform",
  description:
    "Evidence-based waterborne outbreak investigation, attack-rate comparison, and candidate water source response-prioritisation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-slate-900 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
