import { Save } from 'lucide-react';

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
import { createStationAction } from '@/server/stations/actions';
import AdminDatabaseUnavailable from '@/views/admin/AdminDatabaseUnavailable';

export const dynamic = 'force-dynamic';

type NewStationPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewStationPage({
  searchParams,
}: NewStationPageProps) {
  const params = await searchParams;

  if (!process.env.DATABASE_URL) {
    return <AdminDatabaseUnavailable />;
  }

  return (
    <section className="max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">New station</h2>
        <p className="text-muted-foreground">
          Create an identity for one physical weather station.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Station details</CardTitle>
          <CardDescription>
            The station code is the stable ID used by firmware.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {params.error}
            </div>
          ) : null}
          <form action={createStationAction} className="space-y-4">
            <Label className="flex w-full flex-col items-start gap-1.5">
              Name
              <Input name="name" required />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Station code
              <Input
                name="stationCode"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="main-station"
                required
              />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Location
              <Input name="location" />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Fetch interval
              <Input
                min={1000}
                name="refreshIntervalMs"
                step={500}
                type="number"
                defaultValue={5000}
              />
            </Label>
            <Label className="flex w-full flex-col items-start gap-1.5">
              Description
              <Textarea name="description" />
            </Label>
            <Label>
              <input name="isPublic" type="hidden" value="false" />
              <Checkbox defaultChecked name="isPublic" value="true" />
              Public station
            </Label>
            <Button type="submit">
              <Save className="size-4" />
              Create station
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
