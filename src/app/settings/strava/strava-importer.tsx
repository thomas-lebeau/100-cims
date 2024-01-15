"use client";

import { useActivitiesQuery } from "@/app/components/queries/use-activities-query";
import { useAscentsQuery } from "@/app/components/queries/use-ascents-query";
import { useCimsQuery } from "@/app/components/queries/use-cims-query";
import { useLastSyncQuery } from "@/app/components/queries/use-last-sync-query";
import { useStravaActivities } from "@/app/components/queries/use-strava-activities-query";
import { useSyncMutation } from "@/app/components/queries/use-sync-mutation";
import { Button } from "@/components/ui/button";
import { StravaActivity } from "@/lib/db/activities";
import { Cim } from "@/lib/db/cims";
import { toGeoJSON } from "@mapbox/polyline";
import pointToLineDistance from "@turf/point-to-line-distance";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const MAX_DISTANCE = 25; // in meters;

type Matches = Record<
  StravaActivity["originId"],
  {
    cimIds: Cim["id"][];
    activity: StravaActivity;
  }
>;

function filterActivities(cims: Cim[], activities: StravaActivity[]) {
  let matches: Matches = {};

  for (const activity of activities) {
    const line = toGeoJSON(activity.summaryPolyline);

    for (const cim of cims) {
      const distance = pointToLineDistance(
        [cim.longitude, cim.latitude],
        line,
        { units: "meters" }
      );

      if (distance < MAX_DISTANCE) {
        if (!matches[activity.originId]) {
          matches[activity.originId] = {
            cimIds: [],
            activity,
          };
        }

        matches[activity.originId].cimIds.push(cim.id);
      }
    }
  }
  return matches;
}

export default function StravaImporter() {
  const { data: cims } = useCimsQuery();
  const { data: lastSync } = useLastSyncQuery();
  const { data: ascents } = useAscentsQuery();
  const { data: activities } = useActivitiesQuery();
  const { isPending, mutate } = useSyncMutation();
  const {
    data: stravaActivities,
    error,
    isFetching,
  } = useStravaActivities({ since: lastSync?.endAt }); // TODO: implement enable: false when last sync is loading

  const newActivities = useMemo(
    () => filterActivities(cims, stravaActivities),
    [stravaActivities, cims]
  );
  const newAscents = Object.values(newActivities);

  if (error) return <p>Error!!!</p>;
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
        <p>
          ✅ found {newAscents.length} activities (of {stravaActivities.length})
        </p>
      )}

      <Button
        disabled={isPending}
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
