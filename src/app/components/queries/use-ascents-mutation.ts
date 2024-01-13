import { Activity } from "@/lib/db/activities";
import {
  DefaultError,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type Variables = {
  cimId: string;
  action: "ADD" | "REMOVE";
  activities?: Omit<Activity, "id" | "userId" | "createdAt" | "updatedAt">[];
};

export function useAscentMutation() {
  const queryClient = useQueryClient();

  const { isPending, variables, mutate } = useMutation<
    unknown,
    DefaultError,
    Variables
  >({
    mutationKey: ["ascents"],
    mutationFn: ({ action, cimId, activities = [] }) =>
      fetch(`/api/ascents/${cimId}`, {
        method: action === "ADD" ? "PUT" : action === "REMOVE" ? "DELETE" : "",
        body: JSON.stringify(activities),
      }).then((res) => res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["ascents"],
      }),
  });

  return { isPending, variables, mutate };
}
