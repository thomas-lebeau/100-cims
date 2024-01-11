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
export type Session = Prisma.SessionGetPayload<Prisma.SessionDefaultArgs>;
export type User = Prisma.UserGetPayload<Prisma.UserDefaultArgs>;
export type VerificationToken =
  Prisma.VerificationTokenGetPayload<Prisma.VerificationTokenDefaultArgs>;
export type Cim = Prisma.CimGetPayload<Prisma.CimDefaultArgs>;
export type Activity = Prisma.ActivityGetPayload<Prisma.ActivityDefaultArgs>;
