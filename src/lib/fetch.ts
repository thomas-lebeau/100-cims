import { headers } from 'next/headers';

type RequestInfo = Request | string;

async function _fetch(input: RequestInfo | URL): Promise<Response> {
  return await fetch(
    `https://100-cims-git-next-thomas-lebeau.vercel.app${input}`,
    {
      headers: headers(),
    }
  );
}

export default _fetch;
