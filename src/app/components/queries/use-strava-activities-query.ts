import { StravaActivity } from "@/types/strava";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";

const PAGE_SIZE = 30;

type Meta = {
  since?: string;
};

const apiResponseSchema = z
  .object({
    name: z.string(),
    originId: z.string(),
    originType: z.literal("STRAVA"),
    sportType: z.string(),
    startDate: z.string().datetime(),
    summaryPolyline: z.string(),
  })
  .array();

function queryFn({ pageParam, meta }: { pageParam: unknown; meta: unknown }) {
  let url = "/api/strava/activities/" + pageParam;
  let _meta: Meta = meta as Meta;

  if (_meta.since) {
    url += "?since=" + _meta.since;
  }

  return fetch(url)
    .then((res) => res.json())
    .then((data) => apiResponseSchema.parse(data));
}

function getNextPageParam(
  lastPage: StravaActivity[],
  pages: StravaActivity[][]
): null | number {
  return lastPage.length >= PAGE_SIZE ? pages.length + 1 : null;
}

export function useStravaActivities(
  options: {
    enabled?: boolean;
  } & Meta = {}
) {
  const meta: Meta = {
    ...(options.since && { since: options.since }),
  };

  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["strava-activities", options.since],
    queryFn,
    initialData: {
      pages: [[]],
      pageParams: [1],
    },
    initialPageParam: 1,
    getNextPageParam,
    refetchOnMount: true,
    meta,
  });

  useEffect(
    function loadNextPage() {
      if (isFetchingNextPage || !hasNextPage) return;

      // fetchNextPage();
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return { data: data.pages.flat(), error, isFetching };
}
