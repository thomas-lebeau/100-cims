import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { toIsoDate } from "../to-iso-date-zod-preprocessor";

export async function getAscents(userId: string) {
  return ascentSchema.array().parse(
    await prisma.ascent.findMany({
      where: {
        userId,
      },
    })
  );
}

export async function addAscents(userId: string, ascents: AscentInput[]) {
  return await prisma.ascent.createMany({
    skipDuplicates: true,
    data: ascents.map(({ cimId, activityId }) => ({
      userId,
      cimId,
      activityId,
    })),
  });
}

export async function addAscent(
  userId: string,
  cimId: string,
  activityId?: string
) {
  return await prisma.ascent.create({
    data: {
      userId,
      cimId,
      activityId,
    },
  });
}

export async function deleteAscent(userId: string, cimId: string) {
  return prisma.ascent.deleteMany({
    where: {
      cimId,
      userId,
    },
  });
}

export type Ascent = Awaited<ReturnType<typeof getAscents>>[0];
export type AscentInput = Omit<
  Ascent,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export const ascentSchema = z.object({
  id: z.string(),
  cimId: z.string(),
  userId: z.string(),
  activityId: z.string().nullable(),
  createdAt: z.preprocess(toIsoDate, z.string().datetime()),
  updatedAt: z.preprocess(toIsoDate, z.string().datetime()),
});
