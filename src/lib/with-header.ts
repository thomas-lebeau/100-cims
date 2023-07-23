import { NextResponse } from 'next/server';

export default function withHeaders<T>(
  response: NextResponse<T>,
  headers: Headers
): NextResponse<T> {
  headers.forEach((value, name) => response.headers.append(name, value));

  return response;
}
