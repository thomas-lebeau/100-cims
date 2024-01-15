import prisma from "@/lib/prisma";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function cleanupExpiredSessions() {
  const now = Date.now();

  return prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date(now - ONE_WEEK),
      },
    },
  });
}

export function cleanupExpiredVerificationTokens() {
  const now = Date.now();

  return prisma.verificationToken.deleteMany({
    where: {
      expires: {
        lt: new Date(now - ONE_WEEK),
      },
    },
  });
}
