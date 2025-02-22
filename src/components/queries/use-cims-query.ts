import type { Cim, CimWithComarca } from "@/lib/db/cims";
import { cimSchema, cimsWithComarcaSchema } from "@/lib/db/cims";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

type Response = {
  error: Error | null;
  isFetching: boolean;
};

/* eslint-disable no-unused-vars, no-redeclare */
export function useCimsQuery(): Response & { data: Cim[] };
export function useCimsQuery(
  includesComarca: true
): Response & { data: CimWithComarca[] };
export function useCimsQuery(
  includesComarca: false
): Response & { data: Cim[] };
export function useCimsQuery(
  includesComarca: boolean
): Response & { data: Cim[] | CimWithComarca[] };
export function useCimsQuery(includesComarca: boolean = false) {
  const { data, error, isFetching } = useQuery({
    queryKey: ["cims", includesComarca],
    queryFn: () => {
      if (includesComarca) {
        return zfetch(
          cimsWithComarcaSchema.array(),
          "/api/cims?includeComarcas=true"
        );
      }

      return zfetch(cimSchema.array(), "/api/cims");
    },
    placeholderData: [],
    staleTime: Infinity,
  });

  return { data, error, isFetching };
}
/* eslint-enable */
