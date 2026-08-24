import { NextResponse } from 'next/server';

import { getDemoPublicWeatherStations } from '@/services/demo-readings.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = getDemoPublicWeatherStations();

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        demo: true,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  );
}
