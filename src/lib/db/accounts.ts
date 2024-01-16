import prisma from "@/lib/prisma";

//TODO: Make react query hook to allow refetch and show activity when connected without page reload
export async function getAccount(
  userId: string,
  provider?: "strava" | "google"
) {
  return await prisma.account.findMany({
    where: {
      userId,
      ...(provider ? { provider } : {}),
    },
  });
}

export async function getAccountIdByStravaId(stravaId: string) {
  return await prisma.account.findFirst({
    where: {
      providerAccountId: stravaId,
      provider: "strava",
    },
  });
}
