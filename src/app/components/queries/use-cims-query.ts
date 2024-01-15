import {
  Cim,
  CimWithComarca,
  cimSchema,
  cimsWithComarcaSchema,
} from "@/lib/db/cims";
import zfetch from "@/lib/zfetch";
import { useQuery } from "@tanstack/react-query";

type Response = {
  error: Error | null;
  isFetching: boolean;
};

/* eslint-disable */
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
    initialData: [], //TODO: set initial data wihth any of the quey if it exsists (and remove stale time)
    staleTime: Infinity,
  });

  return { data, error, isFetching };
}
/* eslint-enable */
