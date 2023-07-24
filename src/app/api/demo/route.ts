import { NextResponse } from 'next/server';

export async function GET() {
  console.log('GET /api/demo/route.ts');

  return NextResponse.json({ foo: 'bar' }, { status: 200 });
}
