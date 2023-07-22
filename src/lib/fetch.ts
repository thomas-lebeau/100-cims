import { headers } from 'next/headers';

type RequestInfo = Request | string;

async function _fetch(input: RequestInfo | URL): Promise<Response> {
  return await fetch(`${input}`, {
    headers: headers(),
  });
}

export default _fetch;
