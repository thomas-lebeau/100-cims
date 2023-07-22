import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import { headers } from 'next/headers';

import NoSsr from '@/components/no-ssr';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';

function getBaseUrl() {
  const host = headers().get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';

  return `${protocol}://${host}`;
}

async function getCims() {
  console.log('baseUrl = ' + getBaseUrl());
  return fetch(`${getBaseUrl()}/api/cims`, {
    credentials: 'include',
  }).then((res) => res.json());
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
