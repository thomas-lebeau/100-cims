import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const sessionToken = await getToken({ req, raw: true });

  if (!sessionToken) {
    return NextResponse.json(
      { error: `sessionToken not found` },
      { status: 301 }
    );
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      user: {
        select: {
          cims: {
            include: {
              comarcas: true,
            },
          },
        },
      },
    },
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { error: `session not found for` },
      { status: 301 }
    );
  }

  return NextResponse.json({ cims: session.user });
}
