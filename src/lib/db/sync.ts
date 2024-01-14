import prisma from "@/lib/prisma";
import { z } from "zod";
import { toIsoDate } from "../to-iso-date-zod-preprocessor";
import { ActivityInput } from "./activities";

export async function getLastSync(userId: string) {
  return syncSchema.nullable().parse(
    await prisma.sync.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  );
}

export async function addSync(userId: string, activities: ActivityInput[]) {
  return await prisma.sync.create({
    data: {
      userId,
      activities: {
        createMany: {
          skipDuplicates: true,
          data: activities.map((activity) => ({
            ...activity,
            userId,
          })),
        },
      },
    },
    include: {
      activities: {
        select: {
          id: true,
        },
      },
    },
  });
}

export type Sync = Awaited<ReturnType<typeof getLastSync>>;

export const syncSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.preprocess(toIsoDate, z.string().datetime()),
  updatedAt: z.preprocess(toIsoDate, z.string().datetime()),
});
