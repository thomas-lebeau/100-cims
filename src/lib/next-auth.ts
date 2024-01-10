import prisma from "@/lib/prisma";
import { StravaAccount, type Account } from "@/types/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import StravaProvider from "next-auth/providers/strava";

import prismaClient from "@/lib/prisma";
import { Token } from "@/types/next-auth";
import { AuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";

const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
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

const stravaProvider = StravaProvider({
  clientId: process.env.STRAVA_CLIENT_ID as string,
  clientSecret: process.env.STRAVA_CLIENT_SECRET as string,

  token: {
    async request({ client, params, checks, provider }) {
      const { token_type, expires_at, refresh_token, access_token } =
        await client.oauthCallback(provider.callbackUrl, params, checks);

      return {
        tokens: {
          token_type,
          expires_at,
          refresh_token,
          access_token,
        },
      };
    },
  },

  authorization: {
    params: {
      scope: "activity:read_all",
    },
  },
});

const providers: Array<Provider> = [googleProvider, stravaProvider];

if (process.env.EMAIL_SERVER_HOST) {
  providers.push(emailProvider);
}

function isSessionExpired(account: Account) {
  return Boolean(account.expires_at && account.expires_at * 1000 < Date.now());
}

async function refreshStravaToken(account: StravaAccount) {
  const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
    method: "POST",
  });

  const tokens = (await response.json()) as Token;

  if (!response.ok) throw tokens;

  await prisma.account.update({
    data: {
      access_token: tokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
      refresh_token: tokens.refresh_token ?? account.refresh_token,
    },
    where: {
      provider_providerAccountId: {
        provider: "strava",
        providerAccountId: account.providerAccountId,
      },
    },
  });
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: providers,
  callbacks: {
    async session({ session, user }) {
      const [account] = (await prisma.account.findMany({
        where: {
          userId: user.id,
          provider: "strava",
        },
      })) as StravaAccount[];

      if (account && isSessionExpired(account)) {
        try {
          refreshStravaToken(account);
        } catch (error) {
          console.error("Error refreshing access token", error);
          // TODO: The error property will be used client-side to handle the refresh token error
          session.error = "RefreshAccessTokenError";
        }
      }

      if (user) {
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
      }

      return session;
    },
  },
};
