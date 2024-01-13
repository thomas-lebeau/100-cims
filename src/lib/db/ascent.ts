import { Activity } from "@/lib/db/activities";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Equal, Expect } from "type-testing";
import { z } from "zod";

export async function getAscents(userId: string) {
  return await prisma.cim.findMany({
    select: {
      id: true,
      activities: {
        select: {
          activityId: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    where: {
      users: {
        some: {
          user: {
            id: userId,
          },
        },
      },
    },
  });
}

export async function addAscent(
  userId: string,
  cimId: string,
  activities?: Omit<Activity, "id" | "userId" | "createdAt" | "updatedAt">[]
) {
  let data: { activities?: Prisma.BatchPayload } = {};

  if (activities) {
    data.activities = await prisma.activity.createMany({
      skipDuplicates: true,
      data: activities?.map((activity) => ({
        ...activity,
        userId,
      })),
    });
  }

  const cimToUserCreate = await prisma.cimToUser.create({
    data: {
      cimId,
      userId,
    },
  });

  return {
    ...cimToUserCreate,
    ...data,
  };
}

export async function deleteAscent(userId: string, cimId: string) {
  return prisma.cimToUser.deleteMany({
    where: {
      cimId,
      userId,
    },
  });
}

export type Ascent = Awaited<ReturnType<typeof getAscents>>[0];

export const ascentSchema = z.object({
  id: z.string(),
  activities: z.array(
    z.object({
      activityId: z.string(),
    })
  ),
  // TODO: is it expensive?
  // use z.string.dateTime() instead?
  createdAt: z.string().transform((date) => new Date(date)),
  updatedAt: z.string().transform((date) => new Date(date)),
});

// Make sure the schema is in sync with prisma type
// eslint-disable-next-line no-unused-vars
type testType = Expect<Equal<z.infer<typeof ascentSchema>, Ascent>>;
