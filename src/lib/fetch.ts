// import { headers } from 'next/headers';

type RequestInfo = Request | string;

async function _fetch(input: RequestInfo | URL): Promise<Response> {
  // const host = headers().get('host');
  // const protocol = host?.includes('localhost') ? 'http' : 'https';

  return await fetch(
    'https://100-cims-git-next-thomas-lebeau.vercel.apps' +
      input /* `${protocol}://${host}${input}` */,
    {
      // headers: headers(),
    }
  );
}

export default _fetch;
