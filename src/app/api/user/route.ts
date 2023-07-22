import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const sessionToken = await getToken({ req, raw: true });

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'sessionToken not found' },
      { status: 301 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { sessionToken } } },
  });

  if (!user) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }

  return NextResponse.json(user, { status: 200 });
}
