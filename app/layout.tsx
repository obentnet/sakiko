import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "./site-config";
import ThemeBootstrap from "./ui/theme-bootstrap";

const chillRound = localFont({
  src: "../public/ChillRoundM.woff2",
  variable: "--font-chill-round",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.title,
  ...(siteConfig.favicon
    ? {
        icons: {
          icon: siteConfig.favicon,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${chillRound.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
