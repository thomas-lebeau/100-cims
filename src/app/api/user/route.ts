import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import withHeaders from '@/lib/with-header';
import serverTimings from '@/lib/server-timings';

export async function GET(req: NextRequest) {
  const serverTiming = new serverTimings();

  serverTiming.start('tkn');

  const sessionToken = await getToken({ req, raw: true });

  serverTiming.stop('tkn');

  if (!sessionToken) {
    return withHeaders(
      NextResponse.json({ error: 'sessionToken not found' }, { status: 301 }),
      serverTiming.headers()
    );
  }

  serverTiming.start('usr');

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { sessionToken } } },
  });

  serverTiming.stop('usr');

  if (!user) {
    return withHeaders(
      NextResponse.json({ error: 'user not found' }, { status: 404 }),
      serverTiming.headers()
    );
  }

  return withHeaders(
    NextResponse.json(user, { status: 200 }),
    serverTiming.headers()
  );
}
