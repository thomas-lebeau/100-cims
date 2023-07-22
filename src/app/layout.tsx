import React from 'react';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import './globals.css';

import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '100-cims',
  description: '100 cims',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics debug={false} />
      </body>
    </html>
  );
}
