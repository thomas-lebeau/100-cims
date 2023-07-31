"use client";

import { type ReactNode } from "react";
import { Session } from "next-auth";
import { SessionProvider as NextSessionProvider } from "next-auth/react";

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
