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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import publicEnvConfig from '@/config/public.env.config';
import { cn } from '@/lib/utils';
import { formatReadingAge, formatReadingTime } from '@/lib/weather-format';
import type {
  ReadingApiResponse,
  WeatherReading,
  WeatherStationSummary,
} from '@/types/weather';
import ReadingsTable from '@/views/weather/ReadingsTable';
import SensorCharts from '@/views/weather/SensorCharts';
import WeatherAlerts from '@/views/weather/WeatherAlerts';
import WeatherMetricGrid from '@/views/weather/WeatherMetricGrid';

type WeatherDashboardProps = {
  canViewPrivateWithoutKey?: boolean;
  initialMonitorMode?: 'private' | 'public';
  initialPrivateRefreshInterval?: number;
  initialPrivateStation?: string;
  initialReadings: WeatherReading[];
  initialError?: string;
  stations: WeatherStationSummary[];
  useDemoData?: boolean;
};

export default function WeatherDashboard({
  canViewPrivateWithoutKey = false,
  initialMonitorMode = 'public',
  initialPrivateRefreshInterval,
  initialPrivateStation = '',
  initialReadings,
  initialError,
  stations,
  useDemoData = publicEnvConfig.NEXT_PUBLIC_DEMO_API,
}: WeatherDashboardProps) {
  const [readings, setReadings] = useState(initialReadings);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState(
    stations[0]?.stationCode ?? ''
  );
  const [monitorMode, setMonitorMode] = useState<'private' | 'public'>(
    initialMonitorMode
  );
  const [privateStation, setPrivateStation] = useState(initialPrivateStation);
  const [privateStationKey, setPrivateStationKey] = useState('');
  const [privateRefreshInterval, setPrivateRefreshInterval] = useState(
    initialPrivateRefreshInterval ?? 5000
  );

  const latest = readings[0];
  const readingsApiPath = useDemoData ? '/api/demo/readings' : '/api/readings';
  const selectedStationMeta = stations.find(
    (station) => station.stationCode === selectedStation
  );
  const refreshInterval =
    monitorMode === 'private'
      ? privateRefreshInterval
      : (selectedStationMeta?.refreshIntervalMs ??
        publicEnvConfig.NEXT_PUBLIC_WEATHER_REFRESH_INTERVAL);

  const fetchReadings = useCallback(
    async (stationIdentifier: string) => {
      if (
        monitorMode === 'private' &&
        !canViewPrivateWithoutKey &&
        !privateStationKey
      ) {
        setError('Enter a private station API key.');
        return;
      }

      setLoading(true);

      try {
        const headers = new Headers();

        if (monitorMode === 'private') {
          headers.set('X-Station-Key', privateStationKey);
        }

        const response = await fetch(
          `${readingsApiPath}?limit=${publicEnvConfig.NEXT_PUBLIC_DATA_SIZE}&station=${encodeURIComponent(stationIdentifier)}`,
          {
            cache: 'no-store',
            headers,
          }
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
    },
    [canViewPrivateWithoutKey, monitorMode, privateStationKey, readingsApiPath]
  );

  const refresh = useCallback(async () => {
    const stationIdentifier =
      monitorMode === 'private' ? privateStation.trim() : selectedStation;

    if (!stationIdentifier) {
      setError('Enter a private station name or code.');
      return;
    }

    await fetchReadings(stationIdentifier);
  }, [fetchReadings, monitorMode, privateStation, selectedStation]);

  useEffect(() => {
    if (
      monitorMode !== 'private' ||
      !privateStation.trim() ||
      (!canViewPrivateWithoutKey && !privateStationKey.trim())
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchReadings(privateStation.trim());
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    canViewPrivateWithoutKey,
    fetchReadings,
    monitorMode,
    privateStation,
    privateStationKey,
  ]);

  useEffect(() => {
    if (!publicEnvConfig.NEXT_PUBLIC_WEATHER_REFRESH_ENABLED) {
      return;
    }

    const timer = window.setInterval(refresh, refreshInterval);

    return () => window.clearInterval(timer);
  }, [refresh, refreshInterval]);

  const refreshLabel = useMemo(() => {
    const seconds = Math.round(refreshInterval / 1000);

    return `${seconds}s refresh`;
  }, [refreshInterval]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-20 sm:gap-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
              {useDemoData ? `demo data · ${refreshLabel}` : refreshLabel}
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Live Station Monitor
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Live sensor history from{' '}
              {monitorMode === 'private'
                ? privateStation || 'a private station'
                : (selectedStationMeta?.name ?? 'the selected station')}
              , ordered by the newest reading first.
            </p>
          </div>
        </div>
        <div className="grid gap-2 md:w-[420px] md:max-w-[44vw]">
          <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
            <Select
              onValueChange={(value) => {
                if (!value) {
                  return;
                }

                const nextMode = value as 'private' | 'public';
                setMonitorMode(nextMode);
              }}
              value={monitorMode}
            >
              <SelectTrigger aria-label="Monitor mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public stations</SelectItem>
                <SelectItem value="private">Private station</SelectItem>
              </SelectContent>
            </Select>
            {monitorMode === 'public' ? (
              <Select
                onValueChange={(nextStation) => {
                  if (!nextStation) {
                    return;
                  }

                  setSelectedStation(nextStation);
                  void fetchReadings(nextStation);
                }}
                value={selectedStation}
              >
                <SelectTrigger aria-label="Public station" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.stationCode}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                aria-label="Private station name or code"
                onChange={(event) => setPrivateStation(event.target.value)}
                placeholder="Private station name or code"
                value={privateStation}
              />
            )}
          </div>
          {monitorMode === 'private' ? (
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_130px]">
              <Input
                aria-label="Private station API key"
                onChange={(event) => setPrivateStationKey(event.target.value)}
                placeholder={
                  canViewPrivateWithoutKey
                    ? 'Station API key (optional for admin)'
                    : 'Station API key'
                }
                type="password"
                value={privateStationKey}
              />
              <Input
                aria-label="Private fetch interval"
                min={1000}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  if (Number.isFinite(value)) {
                    setPrivateRefreshInterval(
                      Math.min(300000, Math.max(1000, Math.trunc(value)))
                    );
                  }
                }}
                step={500}
                type="number"
                value={privateRefreshInterval}
              />
            </div>
          ) : null}
          {monitorMode === 'private' && canViewPrivateWithoutKey ? (
            <p className="text-xs text-muted-foreground">
              Admin session detected. Private readings can load without a
              station API key.
            </p>
          ) : null}
          <Button
            className="w-full"
            disabled={loading}
            onClick={refresh}
            variant="outline"
          >
            <RefreshCcw className={cn('size-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </header>

      <WeatherAlerts error={error} latest={latest} />
      <WeatherMetricGrid latest={latest} />

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <CardDescription>Latest update</CardDescription>
            <CardTitle className="wrap-break-word">
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
            <Skeleton className="h-80 w-full" />
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
