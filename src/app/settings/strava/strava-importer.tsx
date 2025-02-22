"use client";

import { useSyncMutation } from "@/components/mutations/use-sync-mutation";
import { useActivitiesQuery } from "@/components/queries/use-activities-query";
import { useAscentsQuery } from "@/components/queries/use-ascents-query";
import { useCimsQuery } from "@/components/queries/use-cims-query";
import { useLastSyncQuery } from "@/components/queries/use-last-sync-query";
import { useStravaActivities } from "@/components/queries/use-strava-activities-query";
import { Button } from "@/components/ui/button";
import type { StravaActivity } from "@/lib/db/activities";
import type { Cim } from "@/lib/db/cims";
import { cimsToTinyCims, getCimForPolyline } from "@/lib/geojson";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { datadogRum } from "@datadog/browser-rum";

type Matches = Record<
  StravaActivity["originId"],
  {
    cimIds: Cim["id"][];
    activity: StravaActivity;
  }
>;

function filterActivities(cims: Cim[], activities: StravaActivity[]) {
  const matches: Matches = {};

  performance.mark("start");

  for (const activity of activities) {
    const cimIds = getCimForPolyline(
      cimsToTinyCims(cims),
      activity.summaryPolyline
    );

    if (cimIds.length) {
      matches[activity.originId] = {
        cimIds,
        activity,
      };
    }
  }

  performance.mark("end");
  const measure = performance.measure("filterActivities", "start", "end");
  datadogRum.addDurationVital("filterActivities", {
    startTime: Date.now() - measure.startTime,
    duration: measure.duration,
  });

  return matches;
}

export default function StravaImporter() {
  const { data: cims } = useCimsQuery();
  const { data: lastSync, isFetching: isFetchingLastSync } = useLastSyncQuery();
  const { data: ascents } = useAscentsQuery();
  const { data: activities } = useActivitiesQuery();
  const { isPending, mutate } = useSyncMutation();

  const {
    data: stravaActivities,
    error,
    isFetching,
  } = useStravaActivities({
    since: lastSync?.endAt,
    enabled: !isFetchingLastSync,
  });

  const newActivities = useMemo(
    () => filterActivities(cims, stravaActivities),
    [stravaActivities, cims]
  );
  const newAscents = Object.values(newActivities);

  if (error)
    // TODO: If strava auth error, add link to connect strava account
    return <p>{error.message}</p>;
  if (!stravaActivities) return null;

  return (
    <>
      <div>
        <h3 className="text-lg font-medium">Import Activity</h3>
        <p className="text-sm text-muted-foreground">
          Connect your Strava account to import your activities.
        </p>
      </div>

      {isFetching ? (
        <p>🔄 Downloading activities...({stravaActivities.length})</p>
      ) : (
        <p data-testid="strava-importer-status">
          ✅ found {newAscents.length} activities (of {stravaActivities.length})
        </p>
      )}

      <Button
        disabled={isPending || !newAscents.length}
        onClick={() => mutate({ ascents: newAscents })}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Upload
      </Button>

      <ul>
        {newAscents.map(({ activity, cimIds }) => {
          const isUploaded = activities?.some(
            ({ originId }) => originId === activity.originId
          );

          if (!activity) return;

          return (
            <li key={activity.originId} className="mb-8">
              <Link
                href={`https://www.strava.com/activities/${activity.originId}`}
                target="_blank"
              >
                {isUploaded ? "🟢" : "🔴"} {activity.name}
              </Link>

              {cimIds.map((cimId) => {
                const cim = cims.find((cim) => cim.id === cimId);
                const isAscended = ascents?.some(
                  (ascent) => ascent.cimId === cimId
                );

                if (!cim) return;

                return (
                  <span key={cimId}>
                    {isAscended ? "🟢" : "🔴"} {cim.name}
                  </span>
                );
              })}
            </li>
          );
        })}
      </ul>
    </>
  );
}
