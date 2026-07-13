import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "AIVA — AI Voice Agent | Your 24/7 AI Receptionist",
    template: "%s | AIVA",
  },
  description:
    "Open-source AI receptionist that answers calls 24/7, books appointments, takes orders and speaks 8+ languages. Built for clinics, salons, restaurants and hotels.",
  keywords: [
    "AI receptionist",
    "AI voice agent",
    "answering service",
    "virtual receptionist",
    "appointment booking AI",
    "phone order automation",
    "multilingual voice assistant",
  ],
  openGraph: {
    title: "AIVA — AI Voice Agent | Your 24/7 AI Receptionist",
    description:
      "Never miss another call. AIVA answers, books, orders and speaks your customer's language — around the clock.",
    url: BASE,
    siteName: "AIVA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVA — AI Voice Agent",
    description:
      "The AI receptionist that answers every call, in every language, around the clock.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
