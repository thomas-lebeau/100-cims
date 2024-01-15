import { type Prisma } from "@prisma/client";

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
