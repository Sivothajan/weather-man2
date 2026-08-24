import { NextResponse } from 'next/server';

import { getPublicStations } from '@/server/stations/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        message:
          'DATABASE_URL is required for /api/stations. Use /api/demo/stations for demo data.',
      },
      { status: 503 }
    );
  }

  const data = await getPublicStations();

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
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
