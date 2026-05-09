import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteConfig } from "./site-config";
import BackgroundOrnaments from "./ui/background-ornaments";
import CustomCursor from "./ui/custom-cursor";
import ThemeBootstrap from "./ui/theme-bootstrap";
import VChipRegister from "./ui/v-chip-register";

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
      <body className="min-h-full">
        <ThemeBootstrap />
        <VChipRegister />
        <CustomCursor />
        <div
          className="relative min-h-screen overflow-hidden"
          style={{ backgroundColor: "var(--theme-page-bg)" }}
        >
          <div className="absolute inset-0 z-0">
            <BackgroundOrnaments />
          </div>
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
