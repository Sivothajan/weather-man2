import { Monitor, RadioTower } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatReadingTime } from '@/lib/weather-format';
import {
  type DemoStationVisibilityFilter,
  getDemoAdminStations,
} from '@/services/demo-readings.service';

export const dynamic = 'force-dynamic';

type DemoStationsPageProps = {
  searchParams: Promise<{
    visibility?: string;
  }>;
};

function parseVisibility(
  value: string | undefined
): DemoStationVisibilityFilter {
  if (value === 'public' || value === 'private') {
    return value;
  }

  return 'all';
}

function liveStationHref(stationCode: string, refreshIntervalMs: number) {
  const searchParams = new URLSearchParams({
    interval: String(refreshIntervalMs),
    mode: 'private',
    station: stationCode,
  });

  return `/dashboard?${searchParams.toString()}`;
}

export default async function DemoStationsPage({
  searchParams,
}: DemoStationsPageProps) {
  const { visibility: visibilityParam } = await searchParams;
  const visibility = parseVisibility(visibilityParam);
  const stations = getDemoAdminStations(visibility);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">Demo stations</h2>
        <p className="text-muted-foreground">
          Read-only public and private demo stations with dummy API keys.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo visibility</CardTitle>
          <CardDescription>
            Choose public or private, then open a station to inspect demo
            readings and keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex max-w-sm gap-2">
            <Select defaultValue={visibility} name="visibility">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All demo stations</SelectItem>
                <SelectItem value="public">Public demo stations</SelectItem>
                <SelectItem value="private">Private demo stations</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stations.map((station) => (
          <Card key={station.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="flex min-w-0 items-center gap-2">
                  <RadioTower className="size-5 text-primary" />
                  <span className="truncate">{station.name}</span>
                </CardTitle>
                <Badge variant="secondary">Demo</Badge>
              </div>
              <CardDescription>
                {station.stationCode} ·{' '}
                {station.isPublic ? 'Public' : 'Private'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-2 text-muted-foreground">
                <p>
                  Fetch interval:{' '}
                  <span className="text-foreground">
                    {station.refreshIntervalMs} ms
                  </span>
                </p>
                <p>
                  Latest reading:{' '}
                  <span className="text-foreground">
                    {station.latestReading
                      ? formatReadingTime(
                          station.latestReading.timestamp.toISOString()
                        )
                      : 'No readings'}
                  </span>
                </p>
                <p>
                  Latest key use:{' '}
                  <span className="text-foreground">
                    {station.latestKeyUse
                      ? formatReadingTime(station.latestKeyUse.toISOString())
                      : 'Never'}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  render={<Link href={`/admin/demo-stations/${station.id}`} />}
                  size="sm"
                  variant="outline"
                >
                  View
                </Button>
                <Button
                  nativeButton={false}
                  render={
                    <Link href={`/admin/demo-stations/${station.id}/keys`} />
                  }
                  size="sm"
                  variant="ghost"
                >
                  Dummy keys
                </Button>
                <Button
                  nativeButton={false}
                  render={
                    <Link
                      href={liveStationHref(
                        station.stationCode,
                        station.refreshIntervalMs
                      )}
                    />
                  }
                  size="sm"
                  variant="ghost"
                >
                  <Monitor className="size-4" />
                  Live view
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
