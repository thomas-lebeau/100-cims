import type { DefaultError } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Variables = {
  cimId: string;
  action: "ADD" | "REMOVE";
};

export function useAscentMutation() {
  const queryClient = useQueryClient();

  const { isPending, variables, mutate } = useMutation<unknown, DefaultError, Variables>({
    mutationKey: ["ascents"],
    mutationFn: ({ action, cimId }) =>
      fetch(`/api/ascents/${cimId}`, {
        method: action === "ADD" ? "PUT" : action === "REMOVE" ? "DELETE" : "",
      }).then((res) => res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["ascents"],
      }),
  });

  return { isPending, variables, mutate };
}
