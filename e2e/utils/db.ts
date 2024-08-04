import { prisma } from "@/lib/prisma";
import { USER } from "./test-users";

export function cleanupSyncs() {
  return prisma.sync.deleteMany({
    where: {
      userId: USER.userId,
    },
  });
}
