import { ascentSchema } from "@/lib/db/ascent";
import { useQuery } from "@tanstack/react-query";

export function useAscentsQuery() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["ascents"],
    queryFn: () =>
      fetch("/api/ascents")
        .then((res) => res.json())
        .then((data) => ascentSchema.array().parse(data)),
    initialData: [],
  });

  return { data, error, isFetching };
}
