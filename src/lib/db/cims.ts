import prisma from "@/lib/prisma";
import { z } from "zod";
import { toIsoDate } from "../to-iso-date-zod-preprocessor";

export async function getCims() {
  return cimSchema.array().parse(await prisma.cim.findMany());
}

export type Cim = Awaited<ReturnType<typeof getCims>>[0];

export const cimSchema = z.object({
  id: z.string(),
  name: z.string(),
  altitude: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  url: z.string(),
  img: z.string().nullable(),
  essencial: z.boolean(),
  createdAt: z.preprocess(toIsoDate, z.string().datetime()),
  updatedAt: z.preprocess(toIsoDate, z.string().datetime()),
});
