import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { toIsoDate } from "../to-iso-date-zod-preprocessor";
import { comarcaSchema } from "./comarcas";

export type TinyCim = [Cim["id"], Cim["longitude"], Cim["latitude"]];

const tinyCimSchema = z
  .object({
    id: z.string(),
    longitude: z.number(),
    latitude: z.number(),
  })
  .transform((cim) => [cim.id, cim.longitude, cim.latitude] as TinyCim);

export async function getTinyCims() {
  return tinyCimSchema.array().parse(
    await prisma.cim.findMany({
      select: {
        id: true,
        longitude: true,
        latitude: true,
      },
    })
  );
}

/* eslint-disable no-unused-vars, no-redeclare */
export function getCims(): Promise<Cim[]>;
export function getCims(includesComarca: true): Promise<CimWithComarca[]>;
export function getCims(includesComarca: false): Promise<Cim[]>;
export function getCims(
  includesComarca: boolean
): Promise<CimWithComarca[] | Cim[]>;
export function getCims(
  includesComarca: boolean = false
): Promise<CimWithComarca[] | Cim[]> {
  if (includesComarca) {
    return getCimsWithComarcas();
  }
  return getCimsWithoutComarcas();
}
/* eslint-enable */

export async function getCimsWithComarcas() {
  return cimsWithComarcaSchema.array().parse(
    await prisma.cim.findMany({
      include: {
        comarcas: true,
      },
    })
  );
}

export async function getCimsWithoutComarcas() {
  return cimSchema.array().parse(await prisma.cim.findMany());
}

export const cimSchema = z.object({
  id: z.string(),
  name: z.string(),
  altitude: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  url: z.string(),
  img: z.string().nullable(),
  essencial: z.boolean(),
  createdAt: z.preprocess(toIsoDate, z.string().datetime()),
  updatedAt: z.preprocess(toIsoDate, z.string().datetime()),
});
export const cimsWithComarcaSchema = cimSchema.extend({
  comarcas: comarcaSchema.array(),
});

export type Cim = z.infer<typeof cimSchema>;
export type CimWithComarca = z.infer<typeof cimsWithComarcaSchema>;
