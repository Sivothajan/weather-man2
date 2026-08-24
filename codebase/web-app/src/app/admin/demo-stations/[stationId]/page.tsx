import { KeyRound, Monitor } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getDemoAdminStation } from '@/services/demo-readings.service';

export const dynamic = 'force-dynamic';

type DemoStationPageProps = {
  params: Promise<{
    stationId: string;
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

export default async function DemoStationPage({
  params,
}: DemoStationPageProps) {
  const { stationId } = await params;
  const station = getDemoAdminStation(stationId);

  if (!station) {
    notFound();
  }

  return (
    <section className="w-full space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Demo station</Badge>
        <h2 className="font-display text-2xl font-bold">{station.name}</h2>
        <p className="font-mono text-sm text-muted-foreground">
          {station.stationCode}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Station details</CardTitle>
          <CardDescription>
            Demo station details are read-only and separate from real station
            management.
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
              render={<Link href={`/admin/demo-stations/${station.id}/keys`} />}
              variant="outline"
            >
              <KeyRound className="size-4" />
              Dummy keys
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Label className="flex w-full flex-col items-start gap-1.5">
              Name
              <Input disabled value={station.name} />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Location
              <Input disabled value={station.location ?? ''} />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Fetch interval
              <Input disabled value={`${station.refreshIntervalMs} ms`} />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Visibility
              <Input disabled value={station.isPublic ? 'Public' : 'Private'} />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5 lg:col-span-2">
              Description
              <Textarea disabled value={station.description ?? ''} />
            </Label>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
