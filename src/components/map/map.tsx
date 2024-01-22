"use client";

import mapboxgl from "mapbox-gl";
import { createContext, type ReactNode } from "react";

import { useMap } from "./use-map";

import "mapbox-gl/dist/mapbox-gl.css";

export type MapProps = {
  children: ReactNode;
  className?: string;
  geoJsonUrl: string | undefined;
};

const mapContext = createContext<mapboxgl.Map | null>(null);

export function Map({ className, children, geoJsonUrl }: MapProps) {
  const { map, mapContainer } = useMap(geoJsonUrl);

  return (
    <>
      <div ref={mapContainer} className={className}></div>
      <mapContext.Provider value={map}>{children}</mapContext.Provider>
    </>
  );
}

Map.context = mapContext;
