import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type PrismaAccount = Prisma.AccountGetPayload<Prisma.AccountDefaultArgs>;

export type StravaAccount = {
  provider: "strava";
  refresh_token: number;
} & PrismaAccount;

export type GoogleAccount = {
  provider: "google";
  refresh_token: number;
} & PrismaAccount;

export type Account = StravaAccount | GoogleAccount | PrismaAccount;

//TODO: Make react query hook to allow refetch and show activity when connected without page reload
export async function getAccount(
  userId: string,
  provider?: "strava" | "google"
) {
  return await prisma.account.findMany({
    where: {
      userId,
      ...(provider ? { provider } : {}),
    },
  });
}

export async function getAccountIdByStravaId(stravaId: string) {
  return await prisma.account.findFirst({
    where: {
      providerAccountId: stravaId,
      provider: "strava",
    },
  });
}

export function isStravaAccount(account: Account): account is StravaAccount {
  return account.provider === "strava";
}
