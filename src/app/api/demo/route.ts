import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { foo: 'bar' },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
