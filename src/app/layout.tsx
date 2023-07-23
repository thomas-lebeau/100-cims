import React from 'react';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import './globals.css';

import type { Metadata } from 'next';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '100-cims',
  description: '100 cims',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  cn(inter.className);

  return (
    <html lang="en" className="h-screen">
      <body
        className={cn(inter.className, 'h-screen max-h-screen flex flex-col')}
      >
        {children}
        <Analytics debug={false} />
      </body>
    </html>
  );
}
