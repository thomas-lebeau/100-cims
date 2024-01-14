import { cimSchema } from "@/lib/db/cims";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

export function useCimsQuery() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["cims"],
    queryFn: () => zfetch(cimSchema.array(), "/api/cims"),
    initialData: [],
    staleTime: Infinity,
  });

  return { data, error, isFetching };
}
