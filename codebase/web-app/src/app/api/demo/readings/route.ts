import { NextRequest, NextResponse } from 'next/server';

import { getDemoWeatherReadings } from '@/services/demo-readings.service';

const parseLimit = (value: string | null) => {
  const parsed = Number(value ?? 24);

  if (!Number.isFinite(parsed)) {
    return 24;
  }

  return Math.min(500, Math.max(1, Math.trunc(parsed)));
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get('limit'));
  const data = getDemoWeatherReadings(limit);

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        demo: true,
        limit,
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
