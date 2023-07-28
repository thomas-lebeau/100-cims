import mapboxgl from 'mapbox-gl';
import { type FeatureCollection } from 'geojson';
import { useEffect, useRef, useState } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const BOUNDS: mapboxgl.LngLatBoundsLike = [
  [0.170231508703, 40.577228],
  [3.248749, 42.9185248623],
];

const EMPTY_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

export function useMap(geoJsonUrl: string | undefined) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapControls = useRef(new mapboxgl.NavigationControl());

  useEffect(function init() {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      zoom: 9,
      accessToken: TOKEN,
      attributionControl: false,
      bounds: BOUNDS,
      style: 'mapbox://styles/mapbox/outdoors-v12',
    });

    map.on('load', () => {
      map.addControl(mapControls.current, 'top-right');

      map.addSource('comarcas', {
        type: 'geojson',
        data: EMPTY_GEOJSON,
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

      const source = map.getSource('comarcas') as mapboxgl.GeoJSONSource;

      if (!geoJsonUrl?.length) {
        source.setData(EMPTY_GEOJSON);
      } else {
        source.setData(geoJsonUrl);
      }
    },
    [map, geoJsonUrl]
  );

  return { map, mapContainer };
}
