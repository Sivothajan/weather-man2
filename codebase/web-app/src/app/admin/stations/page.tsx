import { Monitor, Plus, RadioTower } from 'lucide-react';
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
  getStations,
  type StationVisibilityFilter,
} from '@/server/stations/service';
import AdminDatabaseUnavailable from '@/views/admin/AdminDatabaseUnavailable';

export const dynamic = 'force-dynamic';

type AdminStationsPageProps = {
  searchParams: Promise<{
    visibility?: string;
  }>;
};

function parseVisibility(value: string | undefined): StationVisibilityFilter {
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

export default async function AdminStationsPage({
  searchParams,
}: AdminStationsPageProps) {
  const { visibility: visibilityParam } = await searchParams;
  const visibility = parseVisibility(visibilityParam);

  if (!process.env.DATABASE_URL) {
    return <AdminDatabaseUnavailable />;
  }

  const stations = await getStations(visibility);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Stations</h2>
          <p className="text-muted-foreground">
            Select public or private stations, then open a station to manage
            identity, polling, and API keys.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/stations/new" />}
        >
          <Plus className="size-4" />
          New station
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Station visibility</CardTitle>
          <CardDescription>
            Public stations appear in the Live Station Monitor. Private stations
            require admin auth or a station API key for data access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex max-w-sm gap-2">
            <Select defaultValue={visibility} name="visibility">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stations</SelectItem>
                <SelectItem value="public">Public stations</SelectItem>
                <SelectItem value="private">Private stations</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {stations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No stations yet</CardTitle>
            <CardDescription>
              {visibility === 'all'
                ? 'No stations matched this view.'
                : `No ${visibility} stations matched this view.`}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stations.map((station) => (
            <Card key={station.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex min-w-0 items-center gap-2">
                    <RadioTower className="size-5 text-primary" />
                    <span className="truncate">{station.name}</span>
                  </CardTitle>
                  <Badge variant={station.isActive ? 'secondary' : 'outline'}>
                    {station.isActive ? 'Active' : 'Inactive'}
                  </Badge>
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
                    render={<Link href={`/admin/stations/${station.id}`} />}
                    size="sm"
                    variant="outline"
                  >
                    Manage
                  </Button>
                  <Button
                    nativeButton={false}
                    render={
                      <Link href={`/admin/stations/${station.id}/keys`} />
                    }
                    size="sm"
                    variant="ghost"
                  >
                    API keys
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
      )}
    </section>
  );
}
