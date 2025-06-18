import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SITOR",
  description: "SITOR - Emotion Detection and Analysis Platform",
  icons: {
    icon: [
      {
        url: "/sitor.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/sitor.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: "/sitor.png",
    apple: [
      {
        url: "/sitor.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
