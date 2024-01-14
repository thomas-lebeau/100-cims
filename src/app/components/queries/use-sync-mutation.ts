import { ActivityInput } from "@/lib/db/activities";
import {
  DefaultError,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type Variables = {
  cimIds: string[];
  activity?: ActivityInput;
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
        body: JSON.stringify(variables),
      }).then((res) => res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["last-syncs"],
      }),
  });

  return { isPending, variables, mutate };
}
