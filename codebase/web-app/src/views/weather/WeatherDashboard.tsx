'use client';

import { ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import publicEnvConfig from '@/config/public.env.config';
import { cn } from '@/lib/utils';
import { formatReadingAge, formatReadingTime } from '@/lib/weather-format';
import type { ReadingApiResponse, WeatherReading } from '@/types/weather';
import ReadingsTable from '@/views/weather/ReadingsTable';
import SensorCharts from '@/views/weather/SensorCharts';
import WeatherAlerts from '@/views/weather/WeatherAlerts';
import WeatherMetricGrid from '@/views/weather/WeatherMetricGrid';

type WeatherDashboardProps = {
  initialReadings: WeatherReading[];
  initialError?: string;
};

export default function WeatherDashboard({
  initialReadings,
  initialError,
}: WeatherDashboardProps) {
  const [readings, setReadings] = useState(initialReadings);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const latest = readings[0];
  const readingsApiPath = publicEnvConfig.NEXT_PUBLIC_DEMO_API
    ? '/api/demo/readings'
    : '/api/readings';

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${readingsApiPath}?limit=${publicEnvConfig.NEXT_PUBLIC_DATA_SIZE}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(`Readings API returned ${response.status}`);
      }

      const payload = (await response.json()) as ReadingApiResponse;
      setReadings(payload.data);
      setError(undefined);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'Could not refresh readings';
      setError(message);
      toast.error('Weather refresh failed', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [readingsApiPath]);

  useEffect(() => {
    if (!publicEnvConfig.NEXT_PUBLIC_WEATHER_REFRESH_ENABLED) {
      return;
    }

    const timer = window.setInterval(
      refresh,
      publicEnvConfig.NEXT_PUBLIC_WEATHER_REFRESH_INTERVAL
    );

    return () => window.clearInterval(timer);
  }, [refresh]);

  const refreshLabel = useMemo(() => {
    const seconds = Math.round(
      publicEnvConfig.NEXT_PUBLIC_WEATHER_REFRESH_INTERVAL / 1000
    );

    return `${seconds}s refresh`;
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-20 sm:gap-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Button
            className="w-fit"
            nativeButton={false}
            render={<Link href="/" />}
            variant="ghost"
          >
            <ArrowLeft className="size-4" />
            Home
          </Button>
          <div className="space-y-2">
            <Badge className="w-fit" variant="secondary">
              {publicEnvConfig.NEXT_PUBLIC_DEMO_API
                ? `demo data · ${refreshLabel}`
                : refreshLabel}
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Weather dashboard
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Live sensor history from the station, ordered by the newest
              reading first.
            </p>
          </div>
        </div>
        <Button
          className="w-full sm:w-fit"
          disabled={loading}
          onClick={refresh}
          variant="outline"
        >
          <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </header>

      <WeatherAlerts error={error} latest={latest} />
      <WeatherMetricGrid latest={latest} />

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <CardDescription>Latest update</CardDescription>
            <CardTitle className="break-words">
              {latest ? formatReadingTime(latest.timestamp) : 'No samples yet'}
            </CardTitle>
          </div>
          <p
            className="font-mono text-sm text-muted-foreground"
            suppressHydrationWarning
          >
            {latest ? formatReadingAge(latest.timestamp) : 'N/A'}
          </p>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          {loading && readings.length === 0 ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <SensorCharts readings={readings} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>History</CardDescription>
          <CardTitle>Recent readings</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadingsTable readings={readings} />
        </CardContent>
      </Card>
    </main>
  );
}
