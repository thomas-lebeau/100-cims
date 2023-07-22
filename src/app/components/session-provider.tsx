'use client';

import React from 'react';
import { Session } from 'next-auth';
import { SessionProvider as NextSessionProvider } from 'next-auth/react';

type SessionProviderProps = {
  session: Session | null;
  children: React.ReactNode;
};

export default function SessionProvider({
  session,
  children,
}: SessionProviderProps) {
  return (
    <NextSessionProvider session={session}>{children}</NextSessionProvider>
  );
}
