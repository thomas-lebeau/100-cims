import prisma from "@/lib/prisma";

//TODO: Make react query hook to allow refetch and show activity when connected without page reload
export async function getAccount(
  userId: string,
  provider?: "strava" | "google"
) {
  return await prisma.account.findMany({
    select: {
      id: true,
      provider: true,
      expires_at: true,
    },
    where: {
      userId,
      ...(provider ? { provider } : {}),
    },
  });
}
