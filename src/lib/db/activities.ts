import prisma from "@/lib/prisma";
import { Extends } from "@/types/extends";
import { Expect } from "type-testing";
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

// take a strava api response and return a db compatible Activity
export const stravaActivitySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    start_date: z.preprocess(toIsoDate, z.string().datetime()),
    map: z.object({
      summary_polyline: z.string(),
    }),
  })
  .transform((data) => ({
    name: data.name,
    originId: data.id.toString(),
    originType: "STRAVA" as const,
    sportType: data.type,
    startDate: data.start_date,
    summaryPolyline: data.map.summary_polyline,
  }));

export type StravaActivity = z.infer<typeof stravaActivitySchema>;

// Make sure the schema is in sync with prisma type
// eslint-disable-next-line no-unused-vars
type test = Expect<Extends<StravaActivity, ActivityInput>>; // TODO: move to a test file

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
