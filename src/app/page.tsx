import React from 'react';

import getServerSession from '@/lib/get-server-session';

import NoSsr from '@/components/no-ssr';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';
import { PUBLIC_API } from '@/lib/api';

async function getThing() {
  return fetch(PUBLIC_API + '/demo/thing')
    .then((res) => res.json())
    .catch((err) => {
      const { message, stack } = err;
      return { message, stack, url: PUBLIC_API };
    });
}

export default async function Home() {
  const session = await getServerSession();
  const data = await getThing();

  return (
    <div className="h-screen max-h-screen flex flex-col">
      <SessionProvider session={session}>
        <Nav />
        <NoSsr>
          <Main data={data} />
        </NoSsr>
      </SessionProvider>
    </div>
  );
}
