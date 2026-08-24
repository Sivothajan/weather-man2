import { KeyRound, Plus, ShieldX, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatReadingTime } from '@/lib/weather-format';
import {
  createStationApiKeyAction,
  deleteRevokedStationApiKeyAction,
  revokeStationApiKeyAction,
} from '@/server/stations/actions';
import { getStation } from '@/server/stations/service';
import AdminDatabaseUnavailable from '@/views/admin/AdminDatabaseUnavailable';

export const dynamic = 'force-dynamic';

type StationKeysPageProps = {
  params: Promise<{
    stationId: string;
  }>;
  searchParams: Promise<{
    createdKey?: string;
    error?: string;
    status?: string;
  }>;
};

export default async function StationKeysPage({
  params,
  searchParams,
}: StationKeysPageProps) {
  const [{ stationId }, query] = await Promise.all([params, searchParams]);

  if (!process.env.DATABASE_URL) {
    return <AdminDatabaseUnavailable />;
  }

  const station = await getStation(stationId);

  if (!station) {
    notFound();
  }

  const createKeyAction = createStationApiKeyAction.bind(null, station.id);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">API keys</h2>
          <p className="text-muted-foreground">
            {station.name} uses station code{' '}
            <span className="font-mono text-foreground">
              {station.stationCode}
            </span>
            .
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/admin/stations/${station.id}`} />}
          variant="outline"
        >
          Station details
        </Button>
      </div>

      {query.createdKey ? (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              New key created
            </CardTitle>
            <CardDescription>
              Copy this key now. Only its hash is stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {query.createdKey}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {query.error || query.status ? (
        <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          {query.error ||
            (query.status === 'deleted' ? 'Key deleted.' : 'Key revoked.')}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create API key</CardTitle>
          <CardDescription>
            Use one key per physical device so rotation is simple.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={createKeyAction}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Label className="flex w-full flex-1 flex-col items-start gap-1.5">
              Key name
              <Input name="name" placeholder="NodeMCU garden unit" required />
            </Label>
            <Button className="self-end" type="submit">
              <Plus className="size-4" />
              Create key
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {station.apiKeys.map((apiKey) => {
          const revokeAction = revokeStationApiKeyAction.bind(
            null,
            station.id,
            apiKey.id
          );
          const deleteAction = deleteRevokedStationApiKeyAction.bind(
            null,
            station.id,
            apiKey.id
          );

          return (
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
                  Status:{' '}
                  <span className="text-foreground">
                    {apiKey.revokedAt ? 'Revoked' : 'Active'}
                  </span>
                </p>
                {!apiKey.revokedAt ? (
                  <form action={revokeAction}>
                    <Button type="submit" variant="destructive">
                      <ShieldX className="size-4" />
                      Revoke
                    </Button>
                  </form>
                ) : (
                  <form action={deleteAction}>
                    <Button type="submit" variant="destructive">
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
