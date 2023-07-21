/* eslint-disable @next/next/no-img-element */

import type { Cim } from '@/types/cim';
import mapboxgl from 'mapbox-gl';
import { renderToStaticMarkup } from 'react-dom/server';

type PopupProps = Pick<Cim, 'name' | 'img' | 'altitude'>;

function Popup({ name, img, altitude }: PopupProps) {
  return (
    <div className="grid gap-4">
      {img ? <img src={img} alt={name} className="rounded-md" /> : null}
      <div className="space-y-2">
        <h4 className="font-medium leading-none text-base">{name}</h4>
        <p className="text-sm text-muted-foreground">{altitude} m</p>
      </div>
    </div>
  );
}

export function createPopup(marker: PopupProps) {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    maxWidth: '320px',
  }).setHTML(renderToStaticMarkup(<Popup {...marker} />)) as mapboxgl.Popup & {
    _content: HTMLElement;
  };

  popup._content.classList.remove('mapboxgl-popup-content');
  popup._content.classList.add(
    'z-50',
    'w-72',
    'rounded-md',
    'border',
    'bg-popover',
    'p-2',
    'text-popover-foreground',
    'shadow-md'
  );

  return popup;
}
