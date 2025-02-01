import { prisma } from "@/lib/prisma";

export function getUser(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      accounts: {
        where: {
          provider: "strava",
        },
      },
    },
  });
}
