import prisma from "@/lib/prisma";
import { cimsSchema, userSchema } from "@/types/cim";

const schema = cimsSchema.element
  .extend({
    users: userSchema.pick({ userId: true }).optional().array().optional(),
  })
  .strict()
  .array();

function mapUsersToClimbed(cims: any) {
  return cims.map((cim: any) => ({
    ...cim,
    climbed: Boolean(cim.users?.length > 0),
  }));
}

export async function getCims(userId: string | undefined) {
  return await prisma.cim
    .findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        altitude: true,
        comarcas: {
          select: {
            name: true,
            codigo: true,
          },
        },
        url: true,
        essencial: true,
        users: userId
          ? {
              where: {
                user: {
                  id: userId,
                },
              },
              select: { userId: true },
            }
          : false,
      },
    })
    .then((cims) => schema.parse(cims))
    .then((cims) => mapUsersToClimbed(cims));
}

export async function getUniqueComarcas() {
  return await prisma.comarca.findMany({
    select: {
      name: true,
      codigo: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
