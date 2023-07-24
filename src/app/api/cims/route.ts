import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import serverTimings from '@/lib/server-timings';
import withHeaders from '@/lib/with-header';
import { PUBLIC_API } from '@/lib/api';

// Return all cims.
// for authenticated users, include a their ascents (`climbed`)
export async function GET(req: NextRequest) {
  const serverTiming = new serverTimings();

  const data = await fetch(PUBLIC_API + '/demo')
    .then((res) => res.json())
    .catch((err) => err);

  serverTiming.start('tkn');

  const sessionToken = await getToken({ req, raw: true });

  serverTiming.stop('tkn');
  serverTiming.start('cim');

  const cims = (
    await prisma.cim.findMany({
      include: {
        comarcas: true,
        users: sessionToken
          ? {
              where: { sessions: { some: { sessionToken } } },
              select: { id: true },
            }
          : false,
      },
    })
  ).map(({ users, ...cim }) => ({
    ...cim,
    climbed: Boolean(users?.length > 0),
  }));

  serverTiming.stop('cim');

  return withHeaders(
    NextResponse.json({ cims, data }, { status: 200 }),
    serverTiming.headers()
  );
}
