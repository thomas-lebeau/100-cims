import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverTimings from '@/lib/server-timings';
import getServerSession from '@/lib/get-server-session';

// Return all cims.
// for authenticated users, include a their ascents (`climbed`)
export async function GET() {
  const serverTiming = new serverTimings();
  const session = await getServerSession();

  serverTiming.start('cim');

  const cims = (
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

  serverTiming.stop('cim');

  return NextResponse.json(cims, {
    status: 200,
    headers: serverTiming.headers(),
  });
}
