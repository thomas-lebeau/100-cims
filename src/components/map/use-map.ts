import mapboxgl from 'mapbox-gl';
import { type FeatureCollection } from 'geojson';
import { useCallback, useEffect, useRef, useState } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const B_BOX: mapboxgl.LngLatBoundsLike = [0.15908, 40.52292, 3.33249, 42.91834];

const INITIAL_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  bbox: B_BOX,
  features: [],
};

export function useMap(geoJsonUrl: string | undefined) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const abortController = useRef<AbortController>(new AbortController());
  const mapControls = useRef(new mapboxgl.NavigationControl());

  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  const setGeoJson = useCallback(
    (geojson: FeatureCollection) => {
      if (!map) return;

      const source = map.getSource('comarcas') as mapboxgl.GeoJSONSource;

      source.setData(geojson);
      map.fitBounds(geojson.bbox as mapboxgl.LngLatBoundsLike);
    },
    [map]
  );

  useEffect(function init() {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      zoom: 9,
      accessToken: TOKEN,
      attributionControl: false,
      bounds: B_BOX,
      style: 'mapbox://styles/mapbox/outdoors-v12',
    });

    map.on('load', () => {
      map.addControl(mapControls.current, 'top-right');

      map.addSource('comarcas', {
        type: 'geojson',
        data: INITIAL_GEOJSON,
      });

      map.addLayer({
        id: 'fill',
        type: 'fill',
        source: 'comarcas',
        layout: {},
        paint: {
          'fill-color': '#f00',
          'fill-opacity': 0.1,
        },
      });

      map.addLayer({
        id: 'outline',
        type: 'line',
        source: 'comarcas',
        layout: {},
        paint: {
          'line-color': '#f00',
          'line-width': 1,
          'line-dasharray': [2, 2],
          'line-blur': 1,
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
