import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const sessionToken = await getToken({ req, raw: true });

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

  return NextResponse.json(cims, { status: 200 });
}
