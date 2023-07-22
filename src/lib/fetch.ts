import { headers } from 'next/headers';

type RequestInfo = Request | string;

async function _fetch(input: RequestInfo | URL): Promise<Response> {
  const host = headers().get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';

  return await fetch(`${protocol}://${host}${input}`, {
    // headers: headers(),
  });
}

export default _fetch;
