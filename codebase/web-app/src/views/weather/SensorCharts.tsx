'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { WeatherReading } from '@/types/weather';

type SensorChartsProps = {
  readings: WeatherReading[];
};

const chartConfig = {
  temperature: {
    label: 'Temperature',
    color: 'var(--color-sensor-temperature)',
  },
  humidity: {
    label: 'Humidity',
    color: 'var(--color-sensor-humidity)',
  },
  soilMoisture: {
    label: 'Soil moisture',
    color: 'var(--color-sensor-soil)',
  },
  rain: {
    label: 'Rain',
    color: 'var(--color-sensor-rain)',
  },
  fire: {
    label: 'Fire',
    color: 'var(--color-sensor-fire)',
  },
} satisfies ChartConfig;

export default function SensorCharts({ readings }: SensorChartsProps) {
  const chartData = readings
    .slice()
    .reverse()
    .map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperature: reading.temperature,
      humidity: reading.humidity,
      soilMoisture: reading.soilMoisture,
      rain: reading.rain ? 1 : 0,
      fire: reading.fire ? 1 : 0,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground sm:h-70">
        No chart data yet
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Environmental readings</h3>
          <p className="text-sm text-muted-foreground">
            Temperature, humidity, and soil moisture over time.
          </p>
        </div>
        <ChartContainer
          className="h-64 min-h-64 w-full sm:h-84 sm:min-h-84"
          config={chartConfig}
        >
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="time"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="temperature"
              dot={false}
              stroke="var(--color-temperature)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="humidity"
              dot={false}
              stroke="var(--color-humidity)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="soilMoisture"
              dot={false}
              stroke="var(--color-soilMoisture)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Alert signals</h3>
          <p className="text-sm text-muted-foreground">
            Rain and fire detection as binary states.
          </p>
        </div>
        <ChartContainer
          className="h-64 min-h-64 w-full sm:h-84 sm:min-h-84"
          config={chartConfig}
        >
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="time"
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, 1]}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="rain"
              dot={false}
              stroke="var(--color-rain)"
              strokeWidth={2}
              type="stepAfter"
            />
            <Line
              dataKey="fire"
              dot={false}
              stroke="var(--color-fire)"
              strokeWidth={2}
              type="stepAfter"
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
