import prisma from "@/lib/prisma";
import { type Equal, type Expect } from "type-testing";
import { z } from "zod";

export async function getCims() {
  return await prisma.cim.findMany();
}

export type Cim = Awaited<ReturnType<typeof getCims>>[0];

export const cimSchema = z.object({
  id: z.string(),
  name: z.string(),
  altitude: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  url: z.string(),
  img: z.string().nullable(),
  essencial: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Make sure the schema is in sync with prisma type
// eslint-disable-next-line no-unused-vars
type testType = Expect<Equal<z.infer<typeof cimSchema>, Cim>>;
