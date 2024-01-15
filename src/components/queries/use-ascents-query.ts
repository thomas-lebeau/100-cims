import { ascentSchema } from "@/lib/db/ascent";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

export function useAscentsQuery({ enabled }: { enabled?: boolean } = {}) {
  const { data, error, isFetching } = useQuery({
    queryKey: ["ascents"],
    queryFn: () => zfetch(ascentSchema.array(), "/api/ascents"),
    placeholderData: [],
    enabled,
  });

  return { data, error, isFetching };
}
