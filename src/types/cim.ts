import { z } from 'zod';

export const cimsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    altitude: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    climbed: z.boolean(),
    url: z.string(),
    img: z.string(),
    essencial: z.boolean(),
    comarcas: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ),
  })
);

export type Cim = z.infer<typeof cimsSchema>[0];
export type Comarca = Cim['comarcas'][0];
