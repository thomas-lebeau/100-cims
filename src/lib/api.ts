const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
const protocol = host?.startsWith('localhost') ? 'http' : 'https';

export const PUBLIC_API = `${protocol}://${host}/api`;

console.log(PUBLIC_API);
