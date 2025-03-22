"use client";

import { Marker as MapBoxMarker } from "mapbox-gl";

import type { CimWithComarca as Cim } from "@/lib/db/cims";
import { useContext, useEffect, useRef } from "react";
import { Map } from "./map";
import { Pin } from "./pin";

type MarkerProps = Cim & {
  climbed: boolean;
  selected: boolean;
  onClick: () => void;
};

export function Marker({ id, longitude, latitude, climbed, selected, onClick }: MarkerProps) {
  const map = useContext(Map.context);
  const markerElem = useRef<SVGSVGElement>(null);
  const marker = useRef<MapBoxMarker | null>(null);

  useEffect(
    function setup() {
      if (!map) return;
      if (!markerElem.current) return;

      marker.current = new MapBoxMarker({
        element: markerElem.current as Element as HTMLElement,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      return () => {
        marker.current?.remove();
      };
    },
    // ignore latitute and longitude changes as they are handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map]
  );

  useEffect(
    function updateCoords() {
      marker.current?.setLngLat([longitude, latitude]);
    },
    [latitude, longitude]
  );

  useEffect(
    function handleSelection() {
      if (!map) return;
      if (!selected) return;

      setTimeout(() => {
        map.flyTo(
          {
            center: [longitude, latitude],
            zoom: 12,
            speed: 1.6,
          },
          { markerId: id }
        );
      }, 0);
    },
    [map, id, selected, longitude, latitude]
  );

  return (
    <div style={{ position: "absolute", top: -999, left: -999 }}>
      <Pin
        ref={markerElem}
        onClick={onClick}
        className={climbed ? "z-10" : ""}
        color={climbed ? Pin.COLOR.GREEN : Pin.COLOR.RED}
      />
    </div>
  );
}
