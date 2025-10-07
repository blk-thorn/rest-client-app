import "@/app/globals.css";
import type { Metadata } from "next";
import AppShell from "@/components/layout/app-shell";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import React from "react";

export const metadata: Metadata = { title: "REST Client", description: "Mini Postman on Next.js" };

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-gray-800 text-white antialiased">
        <NextIntlClientProvider>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
