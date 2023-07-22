/* eslint-disable @next/next/no-img-element */

import type { Cim } from '@/types/cim';
import mapboxgl from 'mapbox-gl';
import { renderToStaticMarkup } from 'react-dom/server';
import { CheckCircle } from 'lucide-react';
import { Button } from '../button';

export type PopupProps = Cim;
function Popup({ name, img, altitude, climbed }: PopupProps) {
  const buttonColor = climbed ? 'text-green-500' : 'text-gray-400';

  return (
    <div className="grid gap-4">
      {img ? <img src={img} alt={name} className="rounded-md" /> : null}
      <div className="flex">
        <div>
          <h4 className="font-medium leading-none text-base">{name}</h4>
          <p className="text-sm text-muted-foreground">{altitude} m</p>
        </div>
        <div className={`ml-auto ${buttonColor}`}>
          <Button variant="ghost" size="sm" disabled>
            <CheckCircle />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function createPopup(props: PopupProps) {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    maxWidth: '320px',
  }).setHTML(renderToStaticMarkup(<Popup {...props} />)) as mapboxgl.Popup & {
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
