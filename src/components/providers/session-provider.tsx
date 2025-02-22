"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextSessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

type SessionProviderProps = {
  session: Session | null;
  children: ReactNode;
};

export default function SessionProvider({
  session,
  children,
}: SessionProviderProps) {
  return (
    <NextSessionProvider session={session}>{children}</NextSessionProvider>
  );
}
