import React from 'react';

import getServerSession from '@/lib/get-server-session';
import prisma from '@/lib/prisma';

import SessionProvider from './components/session-provider';
import Nav from './components/nav';
import Main from './components/main';
import { cimsSchema, userSchema } from '@/types/cim';

const schema = cimsSchema.element
  .extend({
    users: userSchema.pick({ userId: true }).optional().array(),
  })
  .strict()
  .array();

export default async function Home() {
  const session = await getServerSession();

  const initialCims = await prisma.cim
    .findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        altitude: true,
        comarcas: true,
        url: true,
        essencial: true,
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
    .then((cims) => schema.parse(cims))
    .then((cims) =>
      cims.map(({ users, ...cim }) => ({
        ...cim,
        climbed: Boolean(users?.length > 0),
      }))
    );

  return (
    <div className="h-screen max-h-screen flex flex-col">
      <SessionProvider session={session}>
        <Nav />
        <Main className="grow" initialCims={initialCims} />
      </SessionProvider>
    </div>
  );
}
