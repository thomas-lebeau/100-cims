import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VercelToolbar } from "@vercel/toolbar/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

import { cn } from "@/lib/cn";
import { getFeatureFlags } from "@/lib/flags";

import Providers from "@/components/providers";
import Nav from "../components/nav/nav";
import DatadogRum from "./components/datadog";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "100-cims",
  description: "100 cims",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-screen" suppressHydrationWarning>
      {/* TODO: Add [openGraph](https://vercel.com/thomas-lebeau/100-cims/DUBmc7KBESwUztZABFroBTnPUTDN/og)  */}
      <body className={cn(inter.className, "h-screen max-h-screen flex flex-col")}>
        <Providers>
          <div className="h-screen max-h-screen flex flex-col">
            {children}
            <Nav />
          </div>
          <ToolBars />
        </Providers>
      </body>
    </html>
  );
}

export async function ToolBars() {
  const flags = await getFeatureFlags();

  return (
    <>
      {flags.datadogRum && <DatadogRum flags={flags} />}
      {flags.vercelAnalytics && <SpeedInsights debug={false} />}
      {flags.vercelAnalytics && <Analytics debug={false} />}
      {flags.vercelToolbar && <VercelToolbar />}
      {flags.reactQueryToolbar && <ReactQueryDevtools />}
    </>
  );
}
