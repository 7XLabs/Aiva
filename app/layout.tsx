import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIVA — AI Voice Agent | Your 24/7 AI Receptionist",
  description:
    "AIVA answers calls, books appointments, answers FAQs and takes orders in multiple languages. Built for clinics, salons, restaurants and hotels.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
