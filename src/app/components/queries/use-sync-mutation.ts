import { ActivityInput } from "@/lib/db/activities";
import {
  DefaultError,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type Variables = {
  ascents: {
    cimIds: string[];
    activity: ActivityInput;
  }[];
};

export function useSyncMutation() {
  const queryClient = useQueryClient();

  const { isPending, variables, mutate } = useMutation<
    unknown,
    DefaultError,
    Variables
  >({
    mutationKey: ["ascents"],
    mutationFn: (variables: Variables) =>
      fetch(`/api/sync`, {
        method: "POST",
        body: JSON.stringify(variables.ascents),
      }).then((res) => res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === "ascents" ||
          queryKey[0] === "activities" ||
          queryKey[0] === "last-sync",
      }),
  });

  return { isPending, variables, mutate };
}
