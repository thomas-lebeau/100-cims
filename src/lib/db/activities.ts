import prisma from "@/lib/prisma";
import { z } from "zod";
import { toIsoDate } from "../to-iso-date-zod-preprocessor";

const originType = ["STRAVA", "GPX"] as const;

export type OriginType = (typeof originType)[number] | null;
export type Activity = Awaited<ReturnType<typeof getActivities>>[number];
export type ActivityInput = Omit<
  Activity,
  "id" | "userId" | "syncId" | "createdAt" | "updatedAt"
>;

export const activitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  syncId: z.string().nullable(),
  originId: z.string().nullable(),
  originType: z.enum(originType).nullable(),
  name: z.string(),
  sportType: z.string().nullable(),
  startDate: z.preprocess(toIsoDate, z.string().datetime()),
  summaryPolyline: z.string(),
  createdAt: z.preprocess(toIsoDate, z.string().datetime()),
  updatedAt: z.preprocess(toIsoDate, z.string().datetime()),
});

export const activityInputSchema = activitySchema.omit({
  id: true,
  userId: true,
  syncId: true,
  createdAt: true,
  updatedAt: true,
});

export async function getActivities(userId: string) {
  return activitySchema.array().parse(
    await prisma.activity.findMany({
      where: {
        user: {
          id: userId,
        },
      },
    })
  );
}
