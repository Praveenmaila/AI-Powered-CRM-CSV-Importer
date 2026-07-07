import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI CSV Importer — Intelligent CRM Mapping",
  description:
    "Upload any CSV file and let Google Gemini AI intelligently map your data into a standardized CRM schema. Supports Facebook Leads, Google Ads, marketing exports, and custom CSVs.",
  keywords: ["csv", "importer", "ai", "crm", "gemini", "mapping"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
