import { RequestInit } from 'next/dist/server/web/spec-extension/request';
import { headers } from 'next/headers';

type RequestInfo = Request | string;

async function _fetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const host = headers().get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';

  return await fetch(`${protocol}://${host}${input}`, {
    ...init,
    headers: headers(),
  });
}

export default _fetch;
