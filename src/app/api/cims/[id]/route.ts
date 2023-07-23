import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import serverTimings from '@/lib/server-timings';
import withHeaders from '@/lib/with-header';

type ReqContext = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: ReqContext) {
  const serverTiming = new serverTimings();
  serverTiming.start('tkn');

  const sessionToken = await getToken({ req, raw: true });
  const { id } = params;
  serverTiming.stop('tkn');

  serverTiming.start('auth');

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { sessionToken } } },
    select: { id: true },
  });

  serverTiming.stop('auth');

  if (!user) {
    return withHeaders(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      serverTiming.headers()
    );
  }

  serverTiming.start('usr');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      cims: {
        connect: { id },
      },
    },
  });

  serverTiming.stop('usr');
  serverTiming.start('cim');

  const cims = (
    await prisma.cim.findMany({
      include: {
        comarcas: true,
        users: {
          where: { id: user.id },
          select: { id: true },
        },
      },
    })
  ).map(({ users, ...cim }) => ({
    ...cim,
    climbed: Boolean(users?.length > 0),
  }));

  serverTiming.stop('cim');

  return withHeaders(
    NextResponse.json(cims, { status: 200 }),
    serverTiming.headers()
  );
}

export async function DELETE(req: NextRequest, { params }: ReqContext) {
  const serverTiming = new serverTimings();

  serverTiming.start('tkn');
  const sessionToken = await getToken({ req, raw: true });
  const { id } = params;

  serverTiming.stop('tkn');
  serverTiming.start('auth');

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { sessionToken } } },
    select: { id: true },
  });

  serverTiming.stop('auth');

  if (!user) {
    return withHeaders(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      serverTiming.headers()
    );
  }

  serverTiming.start('usr');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      cims: {
        disconnect: { id },
      },
    },
  });

  serverTiming.stop('usr');
  serverTiming.start('cim');

  const cims = (
    await prisma.cim.findMany({
      include: {
        comarcas: true,
        users: {
          where: { id: user.id },
          select: { id: true },
        },
      },
    })
  ).map(({ users, ...cim }) => ({
    ...cim,
    climbed: Boolean(users?.length > 0),
  }));

  serverTiming.stop('cim');

  return withHeaders(
    NextResponse.json(cims, { status: 200 }),
    serverTiming.headers()
  );
}
