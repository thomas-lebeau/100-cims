import { comarcaSchema } from "@/lib/db/comarcas";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

export function useComarcas() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["comarcas"],
    queryFn: () => zfetch(comarcaSchema.array(), "/api/comarcas"),
    placeholderData: [],
    staleTime: Infinity,
  });

  return { data, error, isFetching };
}
