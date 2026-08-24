import { CloudRain, Droplets, Flame, Sprout, Thermometer } from 'lucide-react';

import { formatNumber } from '@/lib/weather-format';
import type { WeatherReading } from '@/types/weather';
import MetricCard from '@/views/weather/MetricCard';

type WeatherMetricGridProps = {
  latest?: WeatherReading;
};

export default function WeatherMetricGrid({ latest }: WeatherMetricGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        title="Temperature"
        value={formatNumber(latest?.temperature, '°C')}
        description="Ambient sensor reading"
        icon={Thermometer}
        tone="temperature"
      />
      <MetricCard
        title="Humidity"
        value={formatNumber(latest?.humidity, '%')}
        description="Relative air humidity"
        icon={Droplets}
        tone="humidity"
      />
      <MetricCard
        title="Soil moisture"
        value={formatNumber(latest?.soilMoisture, '%')}
        description={
          latest?.soilRaw == null
            ? 'Calibrated moisture level'
            : `Raw ${formatNumber(latest.soilRaw)}`
        }
        icon={Sprout}
        tone="soil"
      />
      <MetricCard
        title="Rain"
        value={latest ? (latest.rain ? 'Detected' : 'Clear') : 'N/A'}
        description={
          latest?.rainRaw == null
            ? 'Rain sensor state'
            : `Raw ${formatNumber(latest.rainRaw)}`
        }
        icon={CloudRain}
        tone="rain"
      />
      <MetricCard
        title="Fire"
        value={latest ? (latest.fire ? 'Detected' : 'Clear') : 'N/A'}
        description="Flame sensor state"
        icon={Flame}
        tone="fire"
      />
    </div>
  );
}
