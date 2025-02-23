import type { Cim, TinyCim } from "@/lib/db/cims";
import { datadogRum } from "@datadog/browser-rum";
import { decode as decodePolyline, toGeoJSON } from "@mapbox/polyline";
import OpenLocationCode from "./open-location-code";
import { CODE_PRECISION_NORMAL } from "./open-location-code";
import pointToLineDistance from "@turf/point-to-line-distance";
import type { BBox } from "geojson";
import { type Feature } from "geojson";

export const MAX_DISTANCE = 25; // in meters;

const PLUS_CODE_RANGE_REGEX = /8F[GHJ]/;
const PLUS_CODE_DIGITS = "23456789CFGHJMPQRVWX";
const SEARCH_PRECISION = 6;
type PlusCode = string;

function extendBBox(bboxA: BBox, bboxB: BBox): BBox {
  return [
    Math.min(bboxA[0], bboxB[0]),
    Math.min(bboxA[1], bboxB[1]),
    Math.max(bboxA[2], bboxB[2]),
    Math.max(bboxA[3], bboxB[3]),
  ];
}

function isArrayofCoord(
  thing: Array<unknown>
): thing is Array<[number, number]> {
  return Array.isArray(thing[0]);
}

export function getBBox(
  things: Array<Feature> | Array<[number, number]>
): BBox {
  if (isArrayofCoord(things)) {
    return things.reduce(
      (bbox: BBox, thing) =>
        extendBBox(bbox, [thing[1], thing[0], thing[1], thing[0]]),
      [Infinity, Infinity, -Infinity, -Infinity]
    );
  }

  return things.reduce(
    (bbox: BBox, thing) => {
      if (!thing.bbox) return bbox;

      return extendBBox(bbox, thing.bbox as BBox);
    },
    [Infinity, Infinity, -Infinity, -Infinity]
  );
}

export function cimsToTinyCims(cims: Cim[]): TinyCim[] {
  return cims.map((cim) => [
    cim.id,
    cim.longitude,
    cim.latitude,
    OpenLocationCode.encode(cim.latitude, cim.longitude, CODE_PRECISION_NORMAL),
  ]);
}

function shortestCommonPrefix(a: PlusCode, b: PlusCode): string {
  if (a === b) {
    return a;
  }

  let i = 0;
  while (a.slice(0, i) === b.slice(0, i)) {
    i++;
  }

  if (i === 0) {
    throw new Error("No common prefix");
  }

  return a.slice(0, i - 1);
}

function getPlusCodeRegex(a: PlusCode, b: PlusCode) {
  const regex = [shortestCommonPrefix(a, b)];
  const start = regex[0].length;

  if (start >= SEARCH_PRECISION) {
    return new RegExp(regex[0].slice(0, SEARCH_PRECISION));
  }

  for (let i = start; i < SEARCH_PRECISION; i++) {
    let code = a.at(i)!;
    regex.push(`[${code}`);

    while (code !== b.at(i)) {
      code = PLUS_CODE_DIGITS[PLUS_CODE_DIGITS.indexOf(code) + 1];
      regex.push(`${code}`);
    }

    regex.push("]");
  }

  return new RegExp(regex.join(""));
}

export function getCimForPolyline(cims: TinyCim[], polyline: string) {
  performance.mark("getCimForPolylineStart");
  const geoJsonLine = toGeoJSON(polyline);

  if (geoJsonLine.coordinates.length < 2) {
    return [];
  }

  const [x1, y1, x2, y2] = getBBox(decodePolyline(polyline));
  const startPlusCode = OpenLocationCode.encode(y1, x1, SEARCH_PRECISION);
  const endPlusCode = OpenLocationCode.encode(y2, x2, SEARCH_PRECISION);

  // TODO: optimize this
  if (
    !startPlusCode.match(PLUS_CODE_RANGE_REGEX) ||
    !endPlusCode.match(PLUS_CODE_RANGE_REGEX)
  ) {
    return []; // The polyline is not in the correct region
  }
  const regex = getPlusCodeRegex(startPlusCode, endPlusCode);
  const cimsInRegion = cims.filter((cim) => cim[3].match(regex));
  const matches = [];

  for (const cim of cimsInRegion) {
    const distance = pointToLineDistance([cim[1], cim[2]], geoJsonLine, {
      units: "meters",
    });

    if (distance < MAX_DISTANCE) {
      matches.push(cim[0]);
    }
  }

  performance.mark("getCimForPolylineEnd");

  const measure = performance.measure(
    "getCimForPolyline",
    "getCimForPolylineStart",
    "getCimForPolylineEnd"
  );

  datadogRum.addDurationVital("getCimForPolyline", {
    startTime: Date.now() - measure.startTime,
    duration: measure.duration,
    context: {
      plusCodeRegex: String(regex),
      cimsInRegion: cimsInRegion.length,
      matches: matches.length,
    },
  });

  return matches;
}
