import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

type ReqContext = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: ReqContext) {
  const sessionToken = await getToken({ req, raw: true });
  const { id } = params;

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { sessionToken } } },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      cims: {
        connect: { id },
      },
    },
  });

  const cims = (
    await prisma.cim.findMany({
      include: {
        comarcas: true,
        users: {
          where: { id: user.id },
          select: { id: true },
        },
      },
    })
  ).map(({ users, ...cim }) => ({
    ...cim,
    climbed: Boolean(users?.length > 0),
  }));

  return NextResponse.json(cims, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: ReqContext) {
  const sessionToken = await getToken({ req, raw: true });
  const { id } = params;

  const user = await prisma.user.findFirst({
    where: { sessions: { some: { sessionToken } } },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      cims: {
        disconnect: { id },
      },
    },
  });

  const cims = (
    await prisma.cim.findMany({
      include: {
        comarcas: true,
        users: {
          where: { id: user.id },
          select: { id: true },
        },
      },
    })
  ).map(({ users, ...cim }) => ({
    ...cim,
    climbed: Boolean(users?.length > 0),
  }));

  return NextResponse.json(cims, { status: 200 });
}
