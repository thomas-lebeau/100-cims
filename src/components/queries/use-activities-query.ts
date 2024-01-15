import { activitySchema } from "@/lib/db/activities";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

export function useActivitiesQuery() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["activities"],
    queryFn: () => zfetch(activitySchema.array(), "/api/activities"),
    placeholderData: [],
  });

  return { data, error, isFetching };
}
