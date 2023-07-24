import React from 'react';

import getServerSession from '@/lib/get-server-session';

import NoSsr from '@/components/no-ssr';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';

const host = process.env.NEXT_PUBLIC_VERCEL_URL;
const protocol = host?.startsWith('localhost') ? 'http' : 'https';

async function getCims() {
  // const res = await fetch(`${protocol}://${host}/api` + '/cims');

  // return await res.json();

  return { protocol, host };
}

export default async function Home() {
  const session = await getServerSession();
  const cims = await getCims();

  return (
    <div className="h-screen max-h-screen flex flex-col">
      <SessionProvider session={session}>
        <Nav />
        <NoSsr>
          <Main data={cims} />
        </NoSsr>
      </SessionProvider>
    </div>
  );
}
