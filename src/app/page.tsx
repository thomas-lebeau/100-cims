import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';

import NoSsr from '@/components/no-ssr';

import data from '../tools/cims.json';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
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
  const session = await getServerSession(authOptions);

  return (
    <>
      <SessionProvider session={session}>
        <Nav />
        <NoSsr>
          <Main cims={cims} />
        </NoSsr>
      </SessionProvider>
    </>
  );
}
