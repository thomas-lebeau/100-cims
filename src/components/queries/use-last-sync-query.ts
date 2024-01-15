import { syncSchema } from "@/lib/db/sync";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

export function useLastSyncQuery() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["last-sync"],
    queryFn: () => zfetch(syncSchema, "/api/sync"),
  });

  return { data, error, isFetching };
}
