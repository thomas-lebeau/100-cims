import prisma from "@/lib/prisma";
import { z } from "zod";
import { type Expect, type Equal } from "type-testing";

const originType = ["STRAVA", "GPX"] as const;

export type OriginType = (typeof originType)[number] | null;
export type Activity = Awaited<ReturnType<typeof getActivities>>[0];

export const activitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  originId: z.string().nullable(),
  originType: z.enum(originType).nullable(),
  name: z.string(),
  sportType: z.string().nullable(),
  startDate: z.date(),
  summaryPolyline: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Make sure the schema is in sync with prisma type
// eslint-disable-next-line no-unused-vars
type testType = Expect<Equal<z.infer<typeof activitySchema>, Activity>>;

export async function getActivities(userId: string, originType?: OriginType) {
  return await prisma.activity.findMany({
    where: {
      ...(originType ? { originType } : {}),
      user: {
        id: userId,
      },
    },
  });
}
