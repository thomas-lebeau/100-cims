'use client';

import { createContext, type ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';

import { useMap } from './use-map';

import 'mapbox-gl/dist/mapbox-gl.css';

export type MapProps = {
  children: ReactNode;
  className?: string;
  geoJsonSource: Array<string> | undefined;
};

const mapContext = createContext<mapboxgl.Map | null>(null);

export function Map({ className, children, geoJsonSource }: MapProps) {
  const { map, mapContainer } = useMap(geoJsonSource);

  return (
    <div ref={mapContainer} className={className}>
      <mapContext.Provider value={map}>{children}</mapContext.Provider>
    </div>
  );
}

Map.context = mapContext;
