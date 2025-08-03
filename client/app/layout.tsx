import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Urbanist } from "next/font/google";

import "./globals.css";
import "./dashboard/dashboard.css";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-urbanist",
});

// Metadata
export const metadata: Metadata = {
  title: "OJverse - Online Judge Platform",
  description: "A modern online judge built with Next.js, TypeScript, and Monaco Editor.",
};

// Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${urbanist.variable} 
          font-sans antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}
