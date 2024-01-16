import { Cim, TinyCim } from "@/lib/db/cims";
import { toGeoJSON } from "@mapbox/polyline";
import pointToLineDistance from "@turf/point-to-line-distance";
import { BBox, type Feature } from "geojson";

export const MAX_DISTANCE = 25; // in meters;

function extendBBox(bboxA: BBox, bboxB: BBox): BBox {
  return [
    Math.min(bboxA[0], bboxB[0]),
    Math.min(bboxA[1], bboxB[1]),
    Math.max(bboxA[2], bboxB[2]),
    Math.max(bboxA[3], bboxB[3]),
  ];
}

export function getBBox(features: Array<Feature>): BBox {
  return features.reduce(
    (bbox: BBox, feature) => {
      if (!feature.bbox) return bbox;

      return extendBBox(bbox, feature.bbox as BBox);
    },
    [Infinity, Infinity, -Infinity, -Infinity]
  );
}

export function cimsToTinyCims(cims: Cim[]): TinyCim[] {
  return cims.map((cim) => [cim.id, cim.longitude, cim.latitude]);
}

export function getCimForPolyline(cims: TinyCim[], polyline: string) {
  const line = toGeoJSON(polyline);
  const matches = [];

  if (line.coordinates.length < 2) {
    return [];
  }

  // TODO: check if cim is in the same region as the activity and return ealier
  for (const cim of cims) {
    const distance = pointToLineDistance([cim[1], cim[2]], line, {
      units: "meters",
    });

    if (distance < MAX_DISTANCE) {
      matches.push(cim[0]);
    }
  }

  return matches;
}
