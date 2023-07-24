import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import serverTimings from '@/lib/server-timings';

async function handler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const serverTiming = new serverTimings();

  serverTiming.start('tkn');

  const sessionToken = await getToken({ req, raw: true });

  serverTiming.stop('tkn');

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: serverTiming.headers() }
    );
  }

  serverTiming.start('auth');

  const { id } = params;

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { sessionToken } } },
    select: { id: true },
  });

  serverTiming.stop('auth');

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: serverTiming.headers() }
    );
  }

  serverTiming.start('usr');

  if (req.method === 'PUT') {
    await prisma.cimToUser.create({
      data: {
        cimId: id,
        userId: user.id,
      },
    });
  } else {
    await prisma.cimToUser.deleteMany({
      where: {
        cimId: id,
        userId: user.id,
      },
    });
  }

  serverTiming.stop('usr');
  serverTiming.start('cim');

  const cims = (
    await prisma.cim.findMany({
      include: {
        comarcas: true,
        users: {
          where: { userId: user.id },
          select: { userId: true },
        },
      },
    })
  ).map(({ users, ...cim }) => ({
    ...cim,
    climbed: Boolean(users?.length > 0),
  }));

  serverTiming.stop('cim');

  return NextResponse.json(cims, {
    status: 200,
    headers: serverTiming.headers(),
  });
}
export const PUT = handler;
export const DELETE = handler;
