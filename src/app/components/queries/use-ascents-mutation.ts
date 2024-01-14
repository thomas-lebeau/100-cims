import { ActivityInput } from "@/lib/db/activities";
import {
  DefaultError,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type Variables = {
  cimIds: string[];
  action: "ADD" | "REMOVE";
  activity?: ActivityInput;
};

export function useAscentMutation() {
  const queryClient = useQueryClient();

  const { isPending, variables, mutate } = useMutation<
    unknown,
    DefaultError,
    Variables
  >({
    mutationKey: ["ascents"],
    mutationFn: ({ action, cimIds, activity }) =>
      fetch(`/api/ascents/${cimId}`, {
        method: action === "ADD" ? "PUT" : action === "REMOVE" ? "DELETE" : "",
        body: JSON.stringify(activity),
      }).then((res) => res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["ascents"],
      }),
  });

  return { isPending, variables, mutate };
}
