import { headers } from 'next/headers';

type RequestInfo = Request | string;

async function _fetch(input: RequestInfo | URL): Promise<Response> {
  // const host = headers().get('host');
  // const protocol = host?.includes('localhost') ? 'http' : 'https';

  const headersData = headers();
  const protocol = headersData.get('x-forwarded-proto');
  const host = headersData.get('host');

  return await fetch(`${protocol}://${host}${input}`, {
    headers: headers(),
  });
}

export default _fetch;
