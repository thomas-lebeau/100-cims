import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('next-auth.session-token')?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'sessionToken not found' },
      { status: 301 }
    );
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { user: true },
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: 'session not found' }, { status: 301 });
  }

  return NextResponse.json({ user: session.user });
}
