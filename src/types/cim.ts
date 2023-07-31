import { z } from "zod";

export const cimsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    altitude: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    climbed: z.boolean().optional(),
    url: z.string(),
    img: z.string().optional(),
    essencial: z.boolean(),
    comarcas: z.array(
      z.object({
        name: z.string(),
        codigo: z.string(),
      })
    ),
  })
);

export const userSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string(),
});

export type Cim = z.infer<typeof cimsSchema>[0];
export type Comarca = Cim["comarcas"][0];
