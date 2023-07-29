import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import rawData from './data.json';
import { type FeatureCollection } from 'geojson';
import { getBBox } from '@/lib/geojson';

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export async function GET(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const result = routeContextSchema.safeParse(context);

    if (!result.success) {
      return NextResponse.json(result.error.issues, { status: 422 });
    }

    const ids = result.data.params.id.split(',');

    const features = (rawData as unknown as FeatureCollection).features.filter(
      (feature) => ids.includes(feature.properties?.CODICOMAR)
    );

    const data: FeatureCollection = {
      type: 'FeatureCollection',
      bbox: getBBox(features),
      features,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
