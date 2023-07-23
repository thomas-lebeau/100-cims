'use client';

import React from 'react';
import mapboxgl from 'mapbox-gl';
import { useState, useCallback, useEffect } from 'react';

import 'mapbox-gl/dist/mapbox-gl.css';

export type MapProps = {
  map: mapboxgl.Map;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const mapContext = React.createContext<mapboxgl.Map | null>(null);

export function Map({ className, children, map, style }: MapProps) {
  const [div, setDiv] = useState<HTMLElement | null>(null);

  const refCallback = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setDiv(node);
    }
  }, []);

  useEffect(
    function appendChildContainer() {
      if (div) {
        div.replaceChildren(
          (map as mapboxgl.Map & { _container: HTMLElement })._container
        );

        const bounds = map.getBounds();

        map.resize();
        map.fitBounds(bounds);
      }
    },
    [div, map]
  );

  return (
    <div ref={refCallback} className={className} style={style}>
      <mapContext.Provider value={map}>{children}</mapContext.Provider>
    </div>
  );
}

Map.context = mapContext;
