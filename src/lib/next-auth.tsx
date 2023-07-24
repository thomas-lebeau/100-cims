import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import prismaClient from '@/lib/prisma';
import { AuthOptions } from 'next-auth';
import { Provider } from 'next-auth/providers';

const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  authorization: {
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code',
    },
  },
});

const emailProvider = EmailProvider({
  server: {
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  },
  from: process.env.EMAIL_FROM,
});

const providers: Array<Provider> = [googleProvider, emailProvider];

if (process.env.EMAIL_SERVER_HOST) {
  providers.push(emailProvider);
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: providers,
};
