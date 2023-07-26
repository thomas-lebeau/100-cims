import React from 'react';

import getServerSession from '@/lib/get-server-session';
import prisma from '@/lib/prisma';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';

export default async function Home() {
  const session = await getServerSession();

  const initialCims = (
    await prisma.cim.findMany({
      include: {
        comarcas: true,
        users: session
          ? {
              where: {
                user: {
                  id: session.user.id,
                },
              },
              select: { userId: true },
            }
          : false,
      },
    })
  ).map(({ users, ...cim }) => ({
    ...cim,
    climbed: Boolean(users?.length > 0),
  }));

  return (
    <div className="h-screen max-h-screen flex flex-col">
      <SessionProvider session={session}>
        <Nav />
        <Main className="grow" initialCims={initialCims} />
      </SessionProvider>
    </div>
  );
}
