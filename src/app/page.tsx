import React from 'react';

import getServerSession from '@/lib/getServerSession';

import NoSsr from '@/components/no-ssr';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';

export default async function Home() {
  const session = await getServerSession();

  return (
    <>
      <SessionProvider session={session}>
        <Nav />
        <NoSsr>
          <Main />
        </NoSsr>
      </SessionProvider>
    </>
  );
}
