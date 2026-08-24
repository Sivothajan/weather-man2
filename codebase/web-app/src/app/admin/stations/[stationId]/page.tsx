import { KeyRound, Monitor, Save } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateStationAction } from '@/server/stations/actions';
import { getStation } from '@/server/stations/service';
import AdminDatabaseUnavailable from '@/views/admin/AdminDatabaseUnavailable';

export const dynamic = 'force-dynamic';

type StationPageProps = {
  params: Promise<{
    stationId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    status?: string;
  }>;
};

function liveStationHref(stationCode: string, refreshIntervalMs: number) {
  const searchParams = new URLSearchParams({
    interval: String(refreshIntervalMs),
    mode: 'private',
    station: stationCode,
  });

  return `/dashboard?${searchParams.toString()}`;
}

export default async function StationPage({
  params,
  searchParams,
}: StationPageProps) {
  const [{ stationId }, query] = await Promise.all([params, searchParams]);

  if (!process.env.DATABASE_URL) {
    return <AdminDatabaseUnavailable />;
  }

  const station = await getStation(stationId);

  if (!station) {
    notFound();
  }

  const updateAction = updateStationAction.bind(null, station.id);

  return (
    <section className="w-full space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">{station.name}</h2>
        <p className="font-mono text-sm text-muted-foreground">
          {station.stationCode}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit station</CardTitle>
          <CardDescription>
            Station code is stable after creation so deployed firmware keeps
            working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
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
              variant="outline"
            >
              <Monitor className="size-4" />
              Live view
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`/admin/stations/${station.id}/keys`} />}
              variant="outline"
            >
              <KeyRound className="size-4" />
              Manage API keys
            </Button>
          </div>
          {query.error || query.status ? (
            <div className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {query.error || 'Station updated.'}
            </div>
          ) : null}
          <form action={updateAction} className="grid gap-4 lg:grid-cols-2">
            <Label className="flex w-full flex-col items-start gap-1.5">
              Name
              <Input defaultValue={station.name} name="name" required />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Location
              <Input defaultValue={station.location ?? ''} name="location" />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Fetch interval
              <Input
                defaultValue={station.refreshIntervalMs}
                min={1000}
                name="refreshIntervalMs"
                step={500}
                type="number"
              />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5 lg:col-span-2">
              Description
              <Textarea
                defaultValue={station.description ?? ''}
                name="description"
              />
            </Label>
            <Label className="lg:col-span-2">
              <input name="isActive" type="hidden" value="false" />
              <Checkbox
                defaultChecked={station.isActive}
                name="isActive"
                value="true"
              />
              Active station
            </Label>
            <Label className="lg:col-span-2">
              <input name="isPublic" type="hidden" value="false" />
              <Checkbox
                defaultChecked={station.isPublic}
                name="isPublic"
                value="true"
              />
              Public station
            </Label>
            <Button className="w-fit" type="submit">
              <Save className="size-4" />
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
