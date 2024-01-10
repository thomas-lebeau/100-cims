import { StravaActivity, stravaActivitySchema } from "@/types/strava";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const PAGE_SIZE = 30;

// TODO: add `since` parameter
function queryFn({ pageParam }: { pageParam: unknown }) {
  return fetch("/api/strava/activities/" + pageParam)
    .then((res) => res.json())
    .then((data) => stravaActivitySchema.array().parse(data));
}

function getNextPageParam(
  lastPage: StravaActivity[],
  pages: StravaActivity[][]
): null | number {
  return lastPage.length >= PAGE_SIZE ? pages.length + 1 : null;
}

export function useAllStravaActivities() {
  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<StravaActivity[]>({
    queryKey: ["strava-activities"],
    queryFn,
    initialData: {
      pages: [[]],
      pageParams: [1],
    },
    initialPageParam: 1,
    getNextPageParam,
  });

  useEffect(
    function loadNextPage() {
      if (isFetchingNextPage || !hasNextPage) return;

      // fetchNextPage(); // FIXME: re enable this
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return { data, error, isFetching };
}
