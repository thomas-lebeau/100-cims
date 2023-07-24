import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import serverTimings from '@/lib/server-timings';
import withHeaders from '@/lib/with-header';

// Return all cims.
// for authenticated users, include a their ascents (`climbed`)
export async function GET() {
  const serverTiming = new serverTimings();

  serverTiming.start('tkn');

  serverTiming.stop('tkn');
  serverTiming.start('cim');

  const cims = await prisma.cim.findMany({
    include: {
      comarcas: true,
    },
  });

  serverTiming.stop('cim');

  return withHeaders(
    NextResponse.json(cims, { status: 200 }),
    serverTiming.headers()
  );
}
