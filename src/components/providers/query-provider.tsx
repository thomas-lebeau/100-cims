"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ReactNode } from "react";
import { useState } from "react";

type QueryProviderProps = {
  children: ReactNode;
};

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            // staleTime: 1000, TODO: dig into this
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,

            /**
             * Disable `refetchOnMount` because we use prefetching (and/or pre-caching)
             *
             * Note: queries with **NO** initialData will still be fetched on mount.
             */
            refetchOnMount: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
