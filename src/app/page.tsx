import React from 'react';

import NoSsr from '@/components/no-ssr';

import data from '../data/cims.json';

import Main from './components/main';

import type { Cim } from '@/types/cim';

function transformToKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function getCims() {
  return data.map(
    ({ name, comarca, altitude, latitude, longitude, essencial, img, url }) => {
      const cim: Cim = {
        id: transformToKebabCase(name),
        name: name,
        comarca: comarca.split(','),
        altitude: +altitude,
        longitude: +longitude,
        latitude: +latitude,
        url: url,
        essencial: essencial,
      };

      if (img) {
        cim.img = img;
      }

      return cim;
    }
  );
}

export default async function Home() {
  const cims = await getCims();

  return (
    <NoSsr>
      <Main cims={cims} />
    </NoSsr>
  );
}
