import mapboxgl from 'mapbox-gl';
import { useState } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

const BOUNDS: mapboxgl.LngLatBoundsLike = [
  [0.170231508703, 40.577228],
  [3.248749, 42.9185248623],
];

export function useMap() {
  const [container] = useState<HTMLDivElement>(() =>
    document.createElement('div')
  );
  container.classList.add('h-full');

  const [map] = useState<mapboxgl.Map>(
    () =>
      new mapboxgl.Map({
        container,
        zoom: 9,
        accessToken: TOKEN,
        attributionControl: false,
        bounds: BOUNDS,
        style: 'mapbox://styles/mapbox/outdoors-v12',
      }) as mapboxgl.Map & { _container: HTMLDivElement }
  );

  return map;
}
