import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import {
  createWeatherReading,
  getRecentWeatherReadings,
  parseReadingLimit,
} from '@/services/readings.service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const limit = parseReadingLimit(searchParams.get('limit'));
    const data = await getRecentWeatherReadings(limit);

    return NextResponse.json(
      {
        data,
        meta: {
          count: data.length,
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
    const payload = await request.json();
    const result = await createWeatherReading(payload);

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
