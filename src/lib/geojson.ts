import { type FeatureCollection, BBox } from 'geojson';

function extendBBox(bboxA: BBox, bboxB: BBox): BBox {
  return [
    Math.min(bboxA[0], bboxB[0]),
    Math.min(bboxA[1], bboxB[1]),
    Math.max(bboxA[2], bboxB[2]),
    Math.max(bboxA[3], bboxB[3]),
  ];
}

export function getBBox(geojson: FeatureCollection): BBox {
  return geojson.features.reduce(
    (bbox: BBox, feature) => {
      if (!feature.bbox) return bbox;

      return extendBBox(bbox, feature.bbox as BBox);
    },
    [Infinity, Infinity, -Infinity, -Infinity]
  );
}
