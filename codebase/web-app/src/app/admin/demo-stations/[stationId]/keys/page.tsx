import { KeyRound } from 'lucide-react';
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
import { formatReadingTime } from '@/lib/weather-format';
import {
  getDemoAdminStation,
  getDemoStationCredentials,
} from '@/services/demo-readings.service';

export const dynamic = 'force-dynamic';

type DemoStationKeysPageProps = {
  params: Promise<{
    stationId: string;
  }>;
};

export default async function DemoStationKeysPage({
  params,
}: DemoStationKeysPageProps) {
  const { stationId } = await params;
  const station = getDemoAdminStation(stationId);

  if (!station) {
    notFound();
  }

  const credential = getDemoStationCredentials().find(
    (item) => item.stationCode === station.stationCode
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Dummy API keys</h2>
          <p className="text-muted-foreground">
            {station.name} uses demo station code{' '}
            <span className="font-mono text-foreground">
              {station.stationCode}
            </span>
            .
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/admin/demo-stations/${station.id}`} />}
          variant="outline"
        >
          Station details
        </Button>
      </div>

      {credential ? (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Demo write key
            </CardTitle>
            <CardDescription>
              Use this only with `/api/demo/readings`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {`X-Station-Id: ${credential.stationCode} X-Station-Key: ${credential.apiKey} Content-Type: application/json`}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {station.apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <CardTitle>{apiKey.name}</CardTitle>
              <CardDescription>
                Prefix <span className="font-mono">{apiKey.keyPrefix}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Created:{' '}
                <span className="text-foreground">
                  {formatReadingTime(apiKey.createdAt.toISOString())}
                </span>
              </p>
              <p>
                Last used:{' '}
                <span className="text-foreground">
                  {apiKey.lastUsedAt
                    ? formatReadingTime(apiKey.lastUsedAt.toISOString())
                    : 'Never'}
                </span>
              </p>
              <p>
                Status: <span className="text-foreground">Demo active</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
