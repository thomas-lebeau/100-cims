import { Cim } from "@/lib/db/cims";
import { toGeoJSON } from "@mapbox/polyline";
import pointToLineDistance from "@turf/point-to-line-distance";
import { StravaActivity } from "./db/activities";

export const STRAVA_BASE_URL = "https://www.strava.com/api/v3";

const MAX_DISTANCE = 25; // in meters;

export function getCimForActivity(cims: Cim[], activities: StravaActivity) {
  const line = toGeoJSON(activities.summaryPolyline);
  const matches = [];

  if (line.coordinates.length < 2) {
    return [];
  }

  // TODO: check if cim is in the same region as the activity and return ealier

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
