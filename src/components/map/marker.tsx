"use client";

import { Marker as MapBoxMarker } from "mapbox-gl";
import { createRoot, Root } from "react-dom/client";

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
  const [isSetup, setIsSetup] = useState<boolean>(false);
  const markerContainer = useRef<HTMLDivElement>(null);
  const markerRoot = useRef<Root>(null);
  const marker = useRef<MapBoxMarker | null>(null);
  const isMounted = useRef(false);

  useEffect(
    function setup() {
      if (!map) return;
      if (!markerContainer.current) return;

      markerRoot.current = createRoot(markerContainer.current);
      marker.current = new MapBoxMarker({ element: markerContainer.current })
        .setLngLat([longitude, latitude])
        .addTo(map);

      setIsSetup(true);

      isMounted.current = true;

      return () => {
        marker.current?.remove();
        isMounted.current = false;

        // It seems like you are supposed to unmount components outside of `useEffect`:
        // https://github.com/facebook/react/issues/25675#issuecomment-1363957941
        setTimeout(() => {
          if (!isMounted.current) {
            markerRoot.current?.unmount();
          }
        }, 0);
      };
    },

    // ignore latitute and longitude changes as they are handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map]
  );

  useEffect(
    function render() {
      if (climbed) {
        markerContainer.current?.classList.add("z-10");
      } else {
        markerContainer.current?.classList.remove("z-10");
      }

      markerRoot.current?.render(
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
    [id, name, climbed, altitude, open, onClickClimb, onClick, isSetup]
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

  return <div ref={markerContainer} />;
}
