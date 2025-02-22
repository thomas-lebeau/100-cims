import type { ActivityInput } from "@/lib/db/activities";
import zfetch from "@/lib/zfetch";
import type { DefaultError } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

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
      zfetch(schema, "/api/sync", {
        method: "POST",
        body: JSON.stringify(variables.ascents),
      }),
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

const schema = z.tuple([z.object({}), z.object({ count: z.number() })]);
