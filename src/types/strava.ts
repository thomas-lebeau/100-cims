import { z } from "zod";

export const stravaActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  start_date: z.string(),
  map: z.object({
    summary_polyline: z.string(),
  }),
});

export type StravaActivity = z.infer<typeof stravaActivitySchema>;
