import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { cache, type ReactNode } from "react";

const getQueryClient = cache(() => new QueryClient());

export default function Hydrate({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const dehydratedState = dehydrate(queryClient);

  return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
}

export async function seedQueryCache(queryKeys: Array<string | boolean>, data: unknown) {
  getQueryClient().setQueryData(queryKeys, data);
}
