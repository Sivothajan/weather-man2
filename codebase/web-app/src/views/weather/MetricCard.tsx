import type { LucideIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: 'temperature' | 'humidity' | 'soil' | 'rain' | 'fire';
};

const toneClasses = {
  temperature: 'text-sensor-temperature bg-sensor-temperature/10',
  humidity: 'text-sensor-humidity bg-sensor-humidity/10',
  soil: 'text-sensor-soil bg-sensor-soil/10',
  rain: 'text-sensor-rain bg-sensor-rain/10',
  fire: 'text-sensor-fire bg-sensor-fire/10',
};

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'temperature',
}: MetricCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 wrap-break-word font-mono text-2xl font-semibold tracking-normal">
            {value}
          </CardTitle>
        </div>
        <span
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-lg',
            toneClasses[tone]
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
