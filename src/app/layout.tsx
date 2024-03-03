import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import { cn } from "@/lib/cn";

import Providers from "@/components/providers";
import Nav from "../components/nav/nav";
import DatadogInit from "./components/datadog";
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
        <DatadogInit />
        <SpeedInsights debug={false} />
        <Analytics debug={false} />
      </body>
    </html>
  );
}
