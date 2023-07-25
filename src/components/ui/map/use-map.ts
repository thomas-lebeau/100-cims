import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const BOUNDS: mapboxgl.LngLatBoundsLike = [
  [0.170231508703, 40.577228],
  [3.248749, 42.9185248623],
];

export function useMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapControls = useRef(new mapboxgl.NavigationControl());

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      zoom: 9,
      accessToken: TOKEN,
      attributionControl: false,
      bounds: BOUNDS,
      style: 'mapbox://styles/mapbox/outdoors-v12',
    });

    map.current?.addControl(mapControls.current, 'top-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  return { map: map.current, mapContainer };
}
