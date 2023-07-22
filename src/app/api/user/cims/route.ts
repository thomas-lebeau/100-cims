import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://');
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const cookieName = `${cookiePrefix}next-auth.session-token`;

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(cookieName)?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: `sessionToken "${cookieName}" not found` },
      { status: 301 }
    );
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { user: true },
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { error: `session not found for sessionToken "${sessionToken}"` },
      { status: 301 }
    );
  }

  return NextResponse.json({ user: session.user });
}
