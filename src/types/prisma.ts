import { type Prisma } from "@prisma/client";

export type StravaAccount = {
  provider: "strava";
  refresh_token: number;
} & Prisma.AccountGetPayload<Prisma.AccountDefaultArgs>;

export type GoogleAccount = {
  provider: "google";
} & Prisma.AccountGetPayload<Prisma.AccountDefaultArgs>;

export type Account = StravaAccount | GoogleAccount;
export type Session = Prisma.SessionGetPayload<Prisma.SessionDefaultArgs>;
export type User = Prisma.UserGetPayload<Prisma.UserDefaultArgs>;
export type VerificationToken =
  Prisma.VerificationTokenGetPayload<Prisma.VerificationTokenDefaultArgs>;
export type Cim = Prisma.CimGetPayload<Prisma.CimDefaultArgs>;
export type Activity = Prisma.ActivityGetPayload<Prisma.ActivityDefaultArgs>;
