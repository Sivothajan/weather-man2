import {
  ArrowRight,
  BarChart3,
  Braces,
  CloudSun,
  Database,
  Send,
} from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import publicEnvConfig from '@/config/public.env.config';
import { getDemoPrivateStationCredentials } from '@/services/demo-readings.service';
import { DemoAuthHint } from '@/views/auth/DemoAuthHint';

export default function WeatherHome() {
  const useDemoData =
    publicEnvConfig.NEXT_PUBLIC_DEMO_API || !process.env.DATABASE_URL;
  const activeReadEndpoint = useDemoData
    ? '/api/demo/readings'
    : '/api/readings';
  const inactiveReadEndpoint = useDemoData
    ? '/api/readings'
    : '/api/demo/readings';
  const activeReadLabel = useDemoData ? 'Read demo API' : 'Read API';
  const demoPrivateStations = useDemoData
    ? getDemoPrivateStationCredentials()
    : [];

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-6 px-4 py-20 sm:gap-8 sm:px-6 sm:py-16">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div className="space-y-6">
            <Badge className="w-fit" variant="secondary">
              <CloudSun className="size-3.5" />
              Weather station web app
            </Badge>
            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                The Weather Man
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                A fresh Next.js live monitor and API for storing and viewing
                environmental sensor readings from multiple stations. The app
                records temperature, humidity, soil moisture, rain detection,
                fire detection, station identity, public/private visibility,
                station polling intervals, and reading timestamps in a
                Prisma-backed database.
              </p>
            </div>
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Button
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                Live Station Monitor
                <ArrowRight className="size-4" />
              </Button>
              <Button
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href={activeReadEndpoint} />}
                variant="outline"
              >
                {activeReadLabel}
              </Button>
              <Button
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/admin/stations" />}
                variant="outline"
              >
                Admin
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardDescription>Data model</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5 text-primary" />
                Station + readings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <p className="text-sm leading-6 text-muted-foreground">
                Prisma stores managed stations, hashed station API keys, admin
                users, and each sample as a station-linked `WeatherReading` row.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>
                {useDemoData
                  ? 'Active demo read endpoint'
                  : 'Active read endpoint'}
              </CardDescription>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                GET {activeReadEndpoint}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {useDemoData
                  ? 'Returns randomly generated readings with the same response shape the Live Station Monitor is using now.'
                  : 'Returns recent database readings for the Live Station Monitor or an external client.'}{' '}
                Pass `limit` to control the number of rows.
              </p>
              <div className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">
                {activeReadEndpoint}?limit=
                {publicEnvConfig.NEXT_PUBLIC_DATA_SIZE}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Write endpoint</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Send className="size-5 text-primary" />
                POST /api/readings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Stores a new sensor sample when station headers match an active
                station API key. Private station reads also require admin auth
                or the station API key.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">
                {
                  'X-Station-Id: main-station X-Station-Key: generated-key Content-Type: application/json'
                }
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>
                {useDemoData ? 'Database read endpoint' : 'Demo endpoint'}
              </CardDescription>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                GET {inactiveReadEndpoint}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {useDemoData
                  ? 'This is the Prisma-backed read endpoint. Set `NEXT_PUBLIC_DEMO_API=false` to make the Live Station Monitor read from it.'
                  : 'Returns randomly generated readings with the same response shape. Set `NEXT_PUBLIC_DEMO_API=true` to make the Live Station Monitor read from it.'}
              </p>
              <div className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground">
                NEXT_PUBLIC_DEMO_API=
                {publicEnvConfig.NEXT_PUBLIC_DEMO_API ? 'true' : 'false'}
                {!process.env.DATABASE_URL ? ' · DATABASE_URL missing' : ''}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Payload shape</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Braces className="size-5 text-primary" />
                JSON body
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                {`{
  "temperature": 25,
  "humidity": 50,
  "soilMoisture": 42,
  "soilRaw": 600,
  "rain": false,
  "rainRaw": 700,
  "fire": false
}`}
              </pre>
            </CardContent>
          </Card>

          {demoPrivateStations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardDescription>Demo private access</CardDescription>
                <CardTitle>Private playground keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  Use these only in demo mode when the Live Station Monitor is
                  switched to Private station.
                </p>
                <div className="grid gap-2">
                  {demoPrivateStations.map((station) => (
                    <div
                      className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground"
                      key={station.stationCode}
                    >
                      {station.name}
                      {'\n'}station={station.stationCode}
                      {'\n'}key={station.apiKey}
                      {'\n'}interval={station.refreshIntervalMs}ms
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {useDemoData ? (
            <Card>
              <CardHeader>
                <CardDescription>Demo auth</CardDescription>
                <CardTitle>Sign-in accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <DemoAuthHint />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  );
}
