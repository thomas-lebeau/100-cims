import { StravaActivity } from "@/lib/db/activities";
import zfetch from "@/lib/zfetch";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";

const PAGE_SIZE = 30;
const FIRST_PAGE = 1;

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
    private: z.boolean(),
  })
  .array();

function queryFn({ pageParam, meta }: { pageParam: unknown; meta: unknown }) {
  let url = "/api/strava/activities/" + pageParam;
  let _meta: Meta = meta as Meta;

  if (_meta.since) {
    url += "?since=" + _meta.since;
  }

  return zfetch(apiResponseSchema, url);
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
    placeholderData: {
      pages: [[]],
      pageParams: [FIRST_PAGE],
    },
    initialPageParam: FIRST_PAGE,
    enabled: options.enabled,
    getNextPageParam,
    meta,
  });

  useEffect(
    function loadNextPage() {
      if (isFetchingNextPage || !hasNextPage) return;

      fetchNextPage(); // TODO: fix this
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return { data: data.pages.flat(), error, isFetching };
}
