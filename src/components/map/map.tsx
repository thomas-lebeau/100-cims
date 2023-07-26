'use client';

import React from 'react';
import mapboxgl from 'mapbox-gl';

import { useMap } from './use-map';

import 'mapbox-gl/dist/mapbox-gl.css';

export type MapProps = {
  children: React.ReactNode;
  className?: string;
};

const mapContext = React.createContext<mapboxgl.Map | null>(null);

export function Map({ className, children }: MapProps) {
  const { map, mapContainer } = useMap();

  return (
    <div ref={mapContainer} className={className}>
      <mapContext.Provider value={map}>{children}</mapContext.Provider>
    </div>
  );
}

Map.context = mapContext;
