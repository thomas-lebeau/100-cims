'use client';

import mapboxgl from 'mapbox-gl';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pin } from './pin';
import type { Cim } from '@/types/cim';
import { useContext, useEffect, useState } from 'react';
import { Map } from './map';
import { createPopup } from './popup';

export function createMarker({ longitude, latitude, climbed }: Cim) {
  const color = climbed ? Pin.COLOR.GREEN : Pin.COLOR.RED;
  const staticElement = renderToStaticMarkup(<Pin color={color} />);

  const element = document.createElement('div');
  element.innerHTML = staticElement;

  return new mapboxgl.Marker({ element }).setLngLat([longitude, latitude]);
}

type MarkerProps = Cim & { selected: boolean };

export function Marker(props: MarkerProps) {
  const popup = createPopup(props);
  const [marker] = useState<mapboxgl.Marker>(() =>
    createMarker(props).setPopup(popup)
  );
  const map = useContext(Map.context);

  useEffect(() => {
    if (map) {
      marker.addTo(map);

      return () => {
        marker.remove();
      };
    }
  }, [map, marker]);

  useEffect(
    function updateLngLat() {
      marker.setLngLat([props.longitude, props.latitude]);
    },
    [marker, props.latitude, props.longitude]
  );

  useEffect(
    function handleSelection() {
      const isOpen = marker.getPopup().isOpen();
      const selected = props.selected;

      if (isOpen && !selected) {
        marker.togglePopup();
      } else if (!isOpen && selected) {
        marker.togglePopup();
      }

      if (selected) {
        map?.jumpTo({
          center: [props.longitude, props.latitude],
          zoom: 12,
        });
      }
    },
    [map, marker, props.selected, props.longitude, props.latitude]
  );

  return null;
}
