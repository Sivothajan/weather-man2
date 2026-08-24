import { Database, Monitor, RadioTower } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminDatabaseUnavailable() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-5 text-primary" />
          Station management needs a database
        </CardTitle>
        <CardDescription>
          The Stations button opens the admin station list where public/private
          stations, polling intervals, and API keys are managed. That page is
          disabled until `DATABASE_URL` is configured because those records are
          stored in Prisma.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">
          DATABASE_URL=postgresql://...
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Demo pages are separate from real station management. Use Demo
          Stations for dummy public/private stations and demo API keys.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/dashboard" />}>
            <Monitor className="size-4" />
            Live Station Monitor
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/admin/demo-stations" />}
            variant="outline"
          >
            <RadioTower className="size-4" />
            Demo Stations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
