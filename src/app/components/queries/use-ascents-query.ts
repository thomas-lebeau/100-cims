import { ascentSchema } from "@/lib/db/ascent";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

export function useAscentsQuery() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["ascents"],
    queryFn: () => zfetch(ascentSchema.array(), "/api/ascents"),
    initialData: [],
    refetchOnMount: true,
  });

  return { data, error, isFetching };
}
