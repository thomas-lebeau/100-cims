import { Cim } from "@/lib/db/cims";
import { toGeoJSON } from "@mapbox/polyline";
import pointToLineDistance from "@turf/point-to-line-distance";
import { StravaActivity } from "./db/activities";

const MAX_DISTANCE = 25; // in meters;

export function getCimForActivity(cims: Cim[], activities: StravaActivity) {
  const line = toGeoJSON(activities.summaryPolyline);
  const matches = [];

  for (const cim of cims) {
    const distance = pointToLineDistance([cim.longitude, cim.latitude], line, {
      units: "meters",
    });

    if (distance < MAX_DISTANCE) {
      matches.push(cim.id);
    }
  }

  return matches;
}
