import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { cookies } from "next/headers";

import { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/providers";
import { routing } from "@/i18n/routing";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";

import "../globals.css";

export const metadata: Metadata = {
  title: "Ajar - Modern Learning Platform",
  description: "Platform belajar interaktif modern dengan materi berkualitas dan gamifikasi.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const theme = cookieStore.get("ajar-theme")?.value || "light";

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  // Handle system theme on server is not possible, so we default to light and let providers handle it.
  // But for explicit dark/light, we set it now to prevent flash.
  const themeClass = theme === "dark" ? "dark" : "";

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${themeClass} h-full antialiased`}>
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <GoogleOneTap />
            <div className="flex min-h-screen flex-col transition-colors duration-300">
              {children}
            </div>
          </NextIntlClientProvider>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
