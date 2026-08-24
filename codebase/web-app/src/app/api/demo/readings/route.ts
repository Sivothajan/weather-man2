import { NextRequest, NextResponse } from 'next/server';

import { getDemoSessionUser } from '@/services/demo-auth.service';
import {
  findDemoWeatherStation,
  getDemoStationCredentials,
  getDemoWeatherReadings,
  verifyDemoStationApiKey,
} from '@/services/demo-readings.service';
import { createWeatherReadingSchema } from '@/services/readings.service';

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
  const station = searchParams.get('station') || 'main-station';
  let resolvedStation = station;

  if (station !== 'all') {
    const stationSummary = findDemoWeatherStation(station);

    if (!stationSummary?.isActive) {
      return NextResponse.json(
        { message: 'Demo station not found' },
        { status: 404 }
      );
    }

    resolvedStation = stationSummary.stationCode;
    const demoUser = await getDemoSessionUser();
    const canReadAsAdmin = demoUser?.role === 'ADMIN';

    if (
      !stationSummary.isPublic &&
      !canReadAsAdmin &&
      !verifyDemoStationApiKey(
        stationSummary.stationCode,
        request.headers.get('X-Station-Key')
      )
    ) {
      return NextResponse.json(
        { message: 'Demo private station requires the dummy API key' },
        { status: 401 }
      );
    }
  }

  const data = getDemoWeatherReadings(limit, resolvedStation);

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        demo: true,
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
}

export async function POST(request: NextRequest) {
  try {
    const stationId = request.headers.get('X-Station-Id');
    const station = stationId ? findDemoWeatherStation(stationId) : null;
    const credential = getDemoStationCredentials().find(
      (item) =>
        item.stationCode === station?.stationCode &&
        item.apiKey === request.headers.get('X-Station-Key')
    );

    if (!station?.isActive || !credential) {
      return NextResponse.json(
        { message: 'Invalid demo station credentials' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const reading = createWeatherReadingSchema.parse(payload);
    const timestamp = reading.timestamp ?? new Date();

    return NextResponse.json(
      {
        reading: {
          id: Date.now(),
          stationId: station.id,
          stationCode: station.stationCode,
          stationName: station.name,
          temperature: reading.temperature,
          humidity: reading.humidity,
          soilMoisture: reading.soilMoisture,
          soilRaw: reading.soilRaw ?? null,
          rain: reading.rain,
          rainRaw: reading.rainRaw ?? null,
          fire: reading.fire,
          timestamp: timestamp.toISOString(),
        },
        alerts: [
          {
            status: 'skipped',
            reason: 'demo mode does not send notifications',
          },
        ],
        meta: {
          demo: true,
          persisted: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Invalid demo weather reading payload' },
      { status: 400 }
    );
  }
}
