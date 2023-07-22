import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('next-auth.session-token')?.value;

  if (!sessionToken) {
    throw new Error('Unauthorized');
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { user: true },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // const user = await prisma.user.findUnique({ where: { id: session.userId } });

  // if (!user) {
  //   throw new Error('User not found');
  // }

  return NextResponse.json({ session });
}
