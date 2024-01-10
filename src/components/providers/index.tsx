import { type ReactNode } from "react";
import QueryProvider from "./query-provider";
import SessionProvider from "./session-provider";
import getServerSession from "@/lib/get-server-session";

export default async function Providers({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  return (
    <SessionProvider session={session}>
      <QueryProvider>{children}</QueryProvider>
    </SessionProvider>
  );
}
