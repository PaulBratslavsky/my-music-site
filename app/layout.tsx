import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EchoVerse | Music Artist & Producer",
  description: "Exploring the boundaries of sound, rhythm, and visual art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
        <Script
          src={`${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}/api/strapi-plugin-music-manager/widget.js`}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
