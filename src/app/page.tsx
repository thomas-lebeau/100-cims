import React from 'react';

import fetch from '@/lib/fetch';
import getServerSession from '@/lib/getServerSession';

import NoSsr from '@/components/no-ssr';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';

async function getCims() {
  return fetch('/api/cims').then((res) => res.json());
}

export default async function Home() {
  const cims = await getCims();
  const session = await getServerSession();

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
