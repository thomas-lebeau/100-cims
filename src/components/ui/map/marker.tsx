'use client';

import mapboxgl from 'mapbox-gl';
import { createRoot } from 'react-dom/client';

import { Pin } from './pin';
import type { Cim } from '@/types/cim';
import { useContext, useEffect, useRef, useState } from 'react';
import { Map } from './map';
import { PopupContent } from './popup-content';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

type MarkerProps = Cim & {
  selected: boolean;
  onClickClimb: (id: string, climbed: boolean) => void; // eslint-disable-line no-unused-vars
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
}: MarkerProps) {
  const map = useContext(Map.context);

  // using `useState` as a Lazy initial ref
  const [markerContainer] = useState(() => document.createElement('div'));
  const [markerRoot] = useState(() => createRoot(markerContainer));
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(
    function setup() {
      if (!map) return;

      const marker = new mapboxgl.Marker(markerContainer)
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current = marker;

      return () => {
        marker.remove();
      };
    },

    // ignore latitute and longitude changes as they are handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, markerContainer]
  );

  useEffect(
    function render() {
      if (climbed) {
        markerContainer.classList.add('z-10');
      } else {
        markerContainer.classList.remove('z-10');
      }

      markerRoot.render(
        <Popover>
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
      selected,
      onClickClimb,
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
      if (!selected) return;

      map?.jumpTo({
        center: [longitude, latitude],
        zoom: 12,
      });
    },
    [map, selected, longitude, latitude]
  );

  return null;
}
