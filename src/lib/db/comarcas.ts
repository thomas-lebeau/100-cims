import prisma from "@/lib/prisma";
import { z } from "zod";
import { toIsoDate } from "../to-iso-date-zod-preprocessor";

// TODO: make react query hook for this
export async function getComarcas() {
  return comarcaSchema.array().parse(
    await prisma.comarca.findMany({
      orderBy: {
        name: "asc",
      },
    })
  );
}

export const comarcaSchema = z.object({
  id: z.string(),
  name: z.string(),
  codigo: z.string(),
  createdAt: z.preprocess(toIsoDate, z.string().datetime()),
  updatedAt: z.preprocess(toIsoDate, z.string().datetime()),
});

export type Comarca = z.infer<typeof comarcaSchema>;
