import { AlertTriangle, Database } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { WeatherReading } from '@/types/weather';

type WeatherAlertsProps = {
  latest?: WeatherReading;
  error?: string;
};

export default function WeatherAlerts({ latest, error }: WeatherAlertsProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <Database className="size-4" />
        <AlertTitle>Data source unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!latest) {
    return (
      <Alert>
        <Database className="size-4" />
        <AlertTitle>No readings yet</AlertTitle>
        <AlertDescription>
          Post the first sensor payload to `/api/readings` to populate the
          dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (!latest.rain && !latest.fire) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {latest.rain ? (
        <Alert>
          <AlertTriangle className="size-4 text-sensor-rain" />
          <AlertTitle>Rain detected</AlertTitle>
          <AlertDescription>
            The station currently reports active rain detection.
          </AlertDescription>
        </Alert>
      ) : null}
      {latest.fire ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Fire detected</AlertTitle>
          <AlertDescription>
            Immediate attention is required near the station.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
