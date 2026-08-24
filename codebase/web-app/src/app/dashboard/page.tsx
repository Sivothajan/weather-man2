import type { Metadata } from 'next';

import publicEnvConfig from '@/config/public.env.config';
import { buildPageMetadata } from '@/config/site-metadata.config';
import { getCurrentUser } from '@/server/auth/session';
import { getPublicStations } from '@/server/stations/service';
import {
  getDemoPublicWeatherStations,
  getDemoWeatherReadings,
} from '@/services/demo-readings.service';
import { getRecentWeatherReadings } from '@/services/readings.service';
import type { WeatherReading, WeatherStationSummary } from '@/types/weather';
import WeatherDashboard from '@/views/weather/WeatherDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Live Station Monitor',
  description:
    'Live public and private weather station monitor for temperature, humidity, soil moisture, rain, and fire sensor readings.',
  path: '/dashboard',
});

type DashboardPageProps = {
  searchParams: Promise<{
    interval?: string;
    mode?: string;
    station?: string;
  }>;
};

function parseInitialInterval(value: string | undefined) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.min(300000, Math.max(1000, Math.trunc(parsed)));
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const query = await searchParams;
  let initialError: string | undefined;
  let readings: WeatherReading[] = [];
  let stations: WeatherStationSummary[] = [];
  const useDemoData =
    publicEnvConfig.NEXT_PUBLIC_DEMO_API || !process.env.DATABASE_URL;
  const user = await getCurrentUser();
  const canViewPrivateWithoutKey = user?.role === 'ADMIN';
  const initialPrivateStation = query.station?.trim() || '';
  const initialMonitorMode =
    query.mode === 'private' && initialPrivateStation ? 'private' : 'public';
  const initialPrivateRefreshInterval = parseInitialInterval(query.interval);

  try {
    stations = useDemoData
      ? getDemoPublicWeatherStations()
      : await getPublicStations();
    const stationCode =
      initialMonitorMode === 'private'
        ? initialPrivateStation
        : stations[0]?.stationCode;

    readings = useDemoData
      ? getDemoWeatherReadings(
          publicEnvConfig.NEXT_PUBLIC_DATA_SIZE,
          stationCode
        )
      : await getRecentWeatherReadings(
          publicEnvConfig.NEXT_PUBLIC_DATA_SIZE,
          stationCode,
          {
            includePrivate: canViewPrivateWithoutKey,
          }
        );
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : 'Could not load weather data';
  }

  return (
    <WeatherDashboard
      initialError={initialError}
      initialReadings={readings}
      initialMonitorMode={initialMonitorMode}
      initialPrivateRefreshInterval={initialPrivateRefreshInterval}
      initialPrivateStation={initialPrivateStation}
      stations={stations}
      canViewPrivateWithoutKey={canViewPrivateWithoutKey}
      useDemoData={useDemoData}
    />
  );
}
