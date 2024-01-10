"use client";

import { useAllStravaActivities } from "@/app/components/queries/use-strava-activities-query";
import { Button } from "@/components/ui/button";
import { Cim } from "@/types/cim";
import { StravaActivity } from "@/types/strava";
import { toGeoJSON } from "@mapbox/polyline";
import pointToLineDistance from "@turf/point-to-line-distance";
import { useMemo } from "react";

const MAX_DISTANCE = 25; // in meters;

type Matches = Record<
  StravaActivity["id"],
  {
    activity: StravaActivity;
    cims: Cim[];
  }
>;

function filterActivities(cims: Cim[], activities: StravaActivity[]) {
  let matches: Matches = {};

  for (const activity of activities) {
    const line = toGeoJSON(activity.map.summary_polyline);

    for (const cim of cims) {
      const distance = pointToLineDistance(
        [cim.longitude, cim.latitude],
        line,
        { units: "meters" }
      );

      if (distance < MAX_DISTANCE) {
        if (!matches[activity.id]) {
          matches[activity.id] = {
            activity: activity,
            cims: [],
          };
        }

        matches[activity.id].cims.push(cim);
      }
    }
  }

  return matches;
}

export default function StravaImporter({
  initialCims,
}: {
  initialCims: Cim[];
}) {
  const { data, error, isFetching } = useAllStravaActivities();

  const matches = useMemo(
    () => filterActivities(initialCims, data.pages.flat()),
    [data, initialCims]
  );

  const activityCount = useMemo(() => Object.keys(matches).length, [matches]);

  const cimCount = useMemo(
    () =>
      Object.values(matches).reduce((acc, match) => {
        return acc + match.cims.length;
      }, 0),
    [matches]
  );

  if (error) return <p>Error!!!</p>;
  if (!data) return null;

  return (
    <>
      <div>
        <h3 className="text-lg font-medium">Import Activity</h3>
        <p className="text-sm text-muted-foreground">
          Connect your Strava account to import your activities.
        </p>
      </div>

      {isFetching ? (
        <p>🔄 Downloading activities...</p>
      ) : (
        <p>
          ✅ found {activityCount} activities matching {cimCount} summits
        </p>
      )}

      {Object.values(matches).map(({ activity, cims }) => (
        <p key={activity.id}>
          <a>{activity.name}</a>
          <ul>
            {cims.map((cim) => (
              <li key={cim.id}>
                <Button
                  variant={cim.climbed ? "destructive" : "default"}
                  onClick={() => {
                    fetch(`/api/cims/${cim.id}`, {
                      method: cim.climbed ? "DELETE" : "PUT",
                      body: JSON.stringify(activity),
                    });
                  }}
                >
                  {cim.name}
                </Button>
              </li>
            ))}
          </ul>
        </p>
      ))}
    </>
  );
}
