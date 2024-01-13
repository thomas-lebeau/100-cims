import { OriginType, activitySchema } from "@/lib/db/activities";
import { useQuery } from "@tanstack/react-query";

export function useActivitiesQuery(
  {
    originType,
  }: {
    originType: OriginType;
  } = { originType: null }
) {
  const { data, error, isFetching } = useQuery({
    queryKey: ["activities", originType],
    queryFn: () =>
      fetch("/api/activities" + `?originType=${originType}`)
        .then((res) => res.json())
        .then((data) => activitySchema.array().parse(data)),
    initialData: [],
    refetchOnMount: false,
  });

  return { data, error, isFetching };
}
