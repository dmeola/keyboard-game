import type { Metadata, Viewport } from "next";
import { Nunito, Fredoka } from "next/font/google";
import { GameProvider } from "@/lib/gameContext";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KeyJr — Learn Letters & Numbers",
  description:
    "A fun, interactive keyboard learning app for children ages 2–6. Press any key to discover letters, numbers, and more!",
  keywords: [
    "kids keyboard learning",
    "alphabet for kids",
    "learn letters",
    "learn numbers",
    "educational app for toddlers",
    "phonics for kids",
    "keyboard junior",
  ],
  openGraph: {
    title: "KeyJr — Learn Letters & Numbers",
    description:
      "A fun, interactive keyboard learning app for children ages 2–6. Press any key to discover letters, numbers, and more!",
    url: "https://keyjr.com",
    siteName: "KeyJr",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyJr — Learn Letters & Numbers",
    description:
      "A fun, interactive keyboard learning app for children ages 2–6. Press any key to discover letters, numbers, and more!",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF6B63",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KeyJr" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full font-sans antialiased">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
