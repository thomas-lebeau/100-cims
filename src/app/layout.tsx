import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import { cn } from "@/lib/cn";

import Nav from "../components/nav/nav";
import "./globals.css";
import Providers from "@/components/providers";

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
      {/* TODO: Add [openGraph](https://vercel.com/thomas-lebeau/100-cims/DUBmc7KBESwUztZABFroBTnPUTDN/og)  */}
      <body
        className={cn(inter.className, "h-screen max-h-screen flex flex-col")}
      >
        <div className="h-screen max-h-screen flex flex-col">
          <Providers>
            <Nav />

            {children}
          </Providers>
        </div>
        <Analytics debug={false} />
      </body>
    </html>
  );
}
