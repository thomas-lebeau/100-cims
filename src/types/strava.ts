import { ActivityInput } from "@/lib/db/activities";
import { toIsoDate } from "@/lib/to-iso-date-zod-preprocessor";
import { type Expect } from "type-testing";
import { z } from "zod";
import { Extends } from "./extends";

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
type test = Expect<Extends<StravaActivity, ActivityInput>>;
