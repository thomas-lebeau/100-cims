import { ascentSchema } from "@/lib/db/ascent";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

export function useAscentsQuery() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["ascents"],
    queryFn: () => zfetch(ascentSchema.array(), "/api/ascents"),
    placeholderData: [],
  });

  return { data, error, isFetching };
}
