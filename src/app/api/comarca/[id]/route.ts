import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from './data.json';

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

    const data = {
      type: 'FeatureCollection',
      features: db.features.filter((feature) =>
        ids.includes(feature.properties.CODICOMAR)
      ),
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
