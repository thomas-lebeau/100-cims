import { type FeatureCollection } from "geojson";
import type { LngLatBoundsLike, GeoJSONSource } from "mapbox-gl";
import {
  Map,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
} from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const B_BOX: LngLatBoundsLike = [0.15908, 40.52292, 3.33249, 42.91834];

const INITIAL_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  bbox: B_BOX,
  features: [],
};

export function useMap(geoJsonUrl: string | undefined) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const abortController = useRef<AbortController>(new AbortController());
  const [map, setMap] = useState<Map | null>(null);

  const setGeoJson = useCallback(
    (geojson: FeatureCollection) => {
      if (!map) return;

      const source = map.getSource("comarcas") as GeoJSONSource;

      source.setData(geojson);
      map.fitBounds(geojson.bbox as LngLatBoundsLike);
    },
    [map]
  );

  useEffect(function init() {
    if (!mapContainer.current) return;

    const map = new Map({
      container: mapContainer.current,
      zoom: 9,
      accessToken: TOKEN,
      attributionControl: false,
      bounds: B_BOX,
      style: "mapbox://styles/mapbox/outdoors-v12",
    });

    map.on("load", () => {
      map.addControl(new NavigationControl(), "top-right");
      map.addControl(new ScaleControl(), "bottom-right");
      map.addControl(
        new GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
        })
      );

      map.addSource("comarcas", {
        type: "geojson",
        data: INITIAL_GEOJSON,
      });

      map.addLayer({
        id: "fill",
        type: "fill",
        source: "comarcas",
        layout: {},
        paint: {
          "fill-color": "#f00",
          "fill-opacity": 0.1,
        },
      });

      map.addLayer({
        id: "outline",
        type: "line",
        source: "comarcas",
        layout: {},
        paint: {
          "line-color": "#f00",
          "line-width": 1,
          "line-dasharray": [2, 2],
          "line-blur": 1,
        },
      });

      setMap(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(
    function setLayerData() {
      if (!map) return;

      abortController.current.abort();

      if (!geoJsonUrl?.length) {
        setGeoJson(INITIAL_GEOJSON);
      } else {
        abortController.current = new AbortController();

        fetch(geoJsonUrl, { signal: abortController.current.signal })
          .then((response) => response.json() as Promise<FeatureCollection>)
          .then((data) => setGeoJson(data))
          .catch(() => {});
      }
    },
    [map, geoJsonUrl, setGeoJson]
  );

  return { map, mapContainer };
}
