import { type ReactNode } from "react";
import QueryProvider from "./query-provider";
import SessionProvider from "./session-provider";
import ThemeProvider from "./theme-provider";
import { auth } from "@/lib/next-auth";

export default async function Providers({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
