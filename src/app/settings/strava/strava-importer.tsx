"use client";

import { useActivitiesQuery } from "@/app/components/queries/use-activities-query";
import { useAscentMutation } from "@/app/components/queries/use-ascents-mutation";
import { useAscentsQuery } from "@/app/components/queries/use-ascents-query";
import { useCimsQuery } from "@/app/components/queries/use-cims-query";
import { useAllStravaActivities } from "@/app/components/queries/use-strava-activities-query";
import { Button } from "@/components/ui/button";
import { Cim } from "@/types/prisma";
import { StravaActivity } from "@/types/strava";
import { toGeoJSON } from "@mapbox/polyline";
import pointToLineDistance from "@turf/point-to-line-distance";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const MAX_DISTANCE = 25; // in meters;

type Matches = Record<Cim["id"], StravaActivity[]>;

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
        if (!matches[cim.id]) {
          matches[cim.id] = [];
        }

        matches[cim.id].push(activity);
      }
    }
  }

  return matches;
}

export default function StravaImporter() {
  const { data: cims } = useCimsQuery();
  const { data: ascents } = useAscentsQuery();
  const { data: activities } = useActivitiesQuery({ originType: "STRAVA" });
  const { isPending, variables, mutate } = useAscentMutation();

  const lastImportedStravaActivity = activities[0];

  const {
    data: stravaActivities,
    error,
    isFetching,
  } = useAllStravaActivities({
    since: lastImportedStravaActivity?.startDate,
  });

  const matches = useMemo(
    () => filterActivities(cims, stravaActivities),
    [stravaActivities, cims]
  );
  const matchActivitiesCount = useMemo(
    () => Object.values(matches).reduce((acc, match) => acc + match.length, 0),
    [matches]
  );

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
          ✅ found {matchActivitiesCount} activities (of{" "}
          {stravaActivities.length}){/*matching {cimCount} summits*/}
        </p>
      )}

      <ul>
        {Object.entries(matches).map(([cimId, stravaActivities]) => {
          const cim = cims.find((cim) => cim.id === cimId);
          const isAcended = ascents.some((ascent) => ascent.id === cimId);

          if (!cim) return;

          return (
            <li key={cim.id} className="mb-8">
              🏔️ {isAcended ? "🟢" : "🔴"} {cim.name}{" "}
              <Button
                disabled={isPending && variables?.cimId === cimId}
                onClick={() =>
                  mutate({
                    action: isAcended ? "REMOVE" : "ADD",
                    cimId,
                    activities: stravaActivities,
                  })
                }
              >
                {isPending && variables?.cimId === cimId && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isAcended ? "remove" : "add"}
              </Button>
              <ul className="ml-8">
                {stravaActivities.map((stravaActivity) => {
                  const isUploaded = activities.some(
                    ({ originId, originType }) =>
                      originType === "STRAVA" &&
                      originId === stravaActivity.originId
                  );

                  return (
                    <li key={stravaActivity.originId}>
                      {isUploaded ? "🟢" : "🔴"}
                      <Link
                        href={`https://www.strava.com/activities/${stravaActivity.originId}`}
                        target="_blank"
                      >
                        {stravaActivity.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </>
  );
}
