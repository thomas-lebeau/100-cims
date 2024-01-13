import { cimSchema } from "@/lib/db/cims";
import { useQuery } from "@tanstack/react-query";

export function useCimsQuery() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["cims"],
    queryFn: () =>
      fetch("/api/cims")
        .then((res) => res.json())
        .then((data) => cimSchema.array().parse(data)),
    initialData: [],
  });

  return { data, error, isFetching };
}
