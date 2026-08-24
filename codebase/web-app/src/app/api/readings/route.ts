import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { auth } from '@/lib/auth';
import {
  findStationSummary,
  verifyStationCredentials,
} from '@/server/stations/service';
import {
  createWeatherReading,
  getRecentWeatherReadings,
  parseReadingLimit,
} from '@/services/readings.service';

async function isAdminRequest(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const role = session
    ? (session.user as typeof session.user & { role?: string }).role
    : undefined;

  return role === 'ADMIN';
}

async function canReadPrivateStation(
  request: NextRequest,
  stationCode: string
) {
  if (await isAdminRequest(request)) {
    return true;
  }

  const station = await verifyStationCredentials(
    stationCode,
    request.headers.get('X-Station-Key')
  );

  return Boolean(station);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          message:
            'DATABASE_URL is required for /api/readings. Use /api/demo/readings for demo data.',
        },
        { status: 503 }
      );
    }

    const limit = parseReadingLimit(searchParams.get('limit'));
    const station = searchParams.get('station') || undefined;

    let resolvedStation = station;
    let includePrivate = false;

    if (station && station !== 'all') {
      const stationSummary = await findStationSummary(station);

      if (!stationSummary?.isActive) {
        return NextResponse.json(
          { message: 'Station not found' },
          { status: 404 }
        );
      }

      resolvedStation = stationSummary.stationCode;

      if (!stationSummary.isPublic) {
        includePrivate = await canReadPrivateStation(
          request,
          stationSummary.stationCode
        );

        if (!includePrivate) {
          return NextResponse.json(
            {
              message: 'Private station access requires admin auth or API key',
            },
            { status: 401 }
          );
        }
      }
    } else {
      includePrivate = await isAdminRequest(request);
    }

    const data = await getRecentWeatherReadings(limit, resolvedStation, {
      includePrivate,
    });

    return NextResponse.json(
      {
        data,
        meta: {
          count: data.length,
          limit,
          station: resolvedStation,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Invalid limit parameter', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Failed to fetch readings:', error);

    return NextResponse.json(
      { message: 'Could not load weather readings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          message:
            'DATABASE_URL is required for /api/readings. Use /api/demo/readings for demo writes.',
        },
        { status: 503 }
      );
    }

    const station = await verifyStationCredentials(
      request.headers.get('X-Station-Id'),
      request.headers.get('X-Station-Key')
    );

    if (!station) {
      return NextResponse.json(
        { message: 'Invalid station credentials' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const result = await createWeatherReading(payload, station.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Invalid weather reading payload', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('Failed to create reading:', error);

    return NextResponse.json(
      { message: 'Could not create weather reading' },
      { status: 500 }
    );
  }
}
