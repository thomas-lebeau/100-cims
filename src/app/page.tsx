import React from 'react';

import getServerSession from '@/lib/get-server-session';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="h-screen max-h-screen flex flex-col">
      <SessionProvider session={session}>
        <Nav />
        <Main className="grow" />
      </SessionProvider>
    </div>
  );
}
