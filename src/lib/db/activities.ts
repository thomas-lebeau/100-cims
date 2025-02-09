import { prisma } from "@/lib/prisma";
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
  private: z.boolean(),
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
    private: z.boolean(),
  })
  .transform((data) => ({
    name: data.name,
    originId: data.id.toString(),
    originType: "STRAVA" as const,
    sportType: data.type,
    startDate: data.start_date,
    summaryPolyline: data.map.summary_polyline,
    private: data.private,
  }));

export type StravaActivity = z.infer<typeof stravaActivitySchema>;

// Make sure the schema is in sync with prisma type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export function updateStravaActivity(
  userId: string,
  originId: string,
  activity: Partial<Pick<ActivityInput, "private" | "name" | "sportType">>
) {
  return prisma.activity.update({
    select: {
      id: true,
      private: true,
      name: true,
      sportType: true,
    },
    where: {
      userId_originType_originId: {
        userId: userId,
        originType: "STRAVA",
        originId,
      },
    },
    data: activity,
  });
}

export function deleteStravaActivity(userId: string, originId: string) {
  return prisma.activity.delete({
    where: {
      userId_originType_originId: {
        userId: userId,
        originType: "STRAVA",
        originId,
      },
    },
  });
}
