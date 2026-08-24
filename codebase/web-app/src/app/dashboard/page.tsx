import type { Metadata } from 'next';

import publicEnvConfig from '@/config/public.env.config';
import { buildPageMetadata } from '@/config/site-metadata.config';
import { getDemoWeatherReadings } from '@/services/demo-readings.service';
import { getRecentWeatherReadings } from '@/services/readings.service';
import type { WeatherReading } from '@/types/weather';
import WeatherDashboard from '@/views/weather/WeatherDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Dashboard',
  description:
    'Live weather station dashboard for temperature, humidity, soil moisture, rain, and fire sensor readings.',
  path: '/dashboard',
});

export default async function DashboardPage() {
  let initialError: string | undefined;
  let readings: WeatherReading[] = [];

  try {
    readings = publicEnvConfig.NEXT_PUBLIC_DEMO_API
      ? getDemoWeatherReadings(publicEnvConfig.NEXT_PUBLIC_DATA_SIZE)
      : await getRecentWeatherReadings(publicEnvConfig.NEXT_PUBLIC_DATA_SIZE);
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : 'Could not load weather data';
  }

  return (
    <WeatherDashboard initialReadings={readings} initialError={initialError} />
  );
}
