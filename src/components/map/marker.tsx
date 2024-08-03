"use client";

import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";

import type { CimWithComarca as Cim } from "@/lib/db/cims";
import { useContext, useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Map } from "./map";
import { Pin } from "./pin";
import { PopupContent } from "./popup-content";

type MarkerProps = Cim & {
  climbed: boolean;
  selected: boolean;
  onClickClimb: (id: string, action: "ADD" | "REMOVE") => void; // eslint-disable-line no-unused-vars
  onClick: (id: string | null) => void; // eslint-disable-line no-unused-vars
};

export function Marker({
  id,
  name,
  longitude,
  latitude,
  altitude,
  climbed,
  selected,
  onClickClimb,
  onClick,
}: MarkerProps) {
  const map = useContext(Map.context);
  const [open, setOpen] = useState(selected);

  // using `useState` as a Lazy initial ref
  const [markerContainer] = useState(() => document?.createElement("div"));
  const [markerRoot] = useState(() => createRoot(markerContainer));
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const isMounted = useRef(false);

  useEffect(
    function setup() {
      if (!map) return;

      const marker = new mapboxgl.Marker(markerContainer)
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current = marker;
      isMounted.current = true;

      return () => {
        marker.remove();
        isMounted.current = false;

        // It seems like you are supposed to unmount components outside of `useEffect`:
        // https://github.com/facebook/react/issues/25675#issuecomment-1363957941
        setTimeout(() => {
          if (!isMounted.current) {
            markerRoot.unmount();
          }
        }, 0);
      };
    },

    // ignore latitute and longitude changes as they are handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, markerContainer]
  );

  useEffect(
    function render() {
      if (climbed) {
        markerContainer.classList.add("z-10");
      } else {
        markerContainer.classList.remove("z-10");
      }

      markerRoot.render(
        <Popover open={open} onOpenChange={(open) => onClick(open ? id : null)}>
          <PopoverTrigger>
            <Pin color={climbed ? Pin.COLOR.GREEN : Pin.COLOR.RED} />
          </PopoverTrigger>
          <PopoverContent>
            <PopupContent
              id={id}
              name={name}
              altitude={altitude}
              climbed={climbed}
              onClickClimb={onClickClimb}
            />
          </PopoverContent>
        </Popover>
      );
    },
    [
      id,
      markerRoot,
      markerContainer,
      name,
      climbed,
      altitude,
      open,
      onClickClimb,
      onClick,
    ]
  );

  useEffect(
    function updateCoords() {
      markerRef.current?.setLngLat([longitude, latitude]);
    },
    [latitude, longitude]
  );

  useEffect(
    function handleSelection() {
      if (!map) return;

      if (!selected) {
        setOpen(false);

        return;
      }

      map.flyTo(
        {
          center: [longitude, latitude],
          zoom: 12,
          speed: 1.6,
        },
        { markerId: id }
      );

      map.on("moveend", (data) => {
        if ("markerId" in data && data.markerId === id) {
          setOpen(true);
        }
      });
    },
    [map, id, selected, longitude, latitude]
  );

  return null;
}
