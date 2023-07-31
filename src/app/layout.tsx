import React from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

import { cn } from "@/lib/cn";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "100-cims",
  description: "100 cims",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-screen">
      <body
        className={cn(inter.className, "h-screen max-h-screen flex flex-col")}
      >
        {children}
        <Analytics debug={false} />
      </body>
    </html>
  );
}
