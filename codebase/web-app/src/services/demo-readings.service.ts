import type { WeatherReading } from '@/types/weather';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round = (value: number, precision = 1) => {
  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
};

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

export function getDemoWeatherReadings(limit = 24): WeatherReading[] {
  const count = clamp(Math.trunc(limit), 1, 500);
  const now = Date.now();
  const baseTemperature = randomBetween(24, 31);
  const baseHumidity = randomBetween(58, 82);
  const baseSoilMoisture = randomBetween(35, 68);
  const isRainyRun = true;
  const hasFireSpike = Math.random() > 0.92;

  return Array.from({ length: count }, (_, index) => {
    const newestFirstIndex = index;
    const trendIndex = count - newestFirstIndex;
    const wave = Math.sin(trendIndex / 3);
    const rain = isRainyRun && newestFirstIndex < 5;
    const fire = hasFireSpike && newestFirstIndex === 0;
    const soilMoisture = clamp(
      baseSoilMoisture + wave * 4 + (rain ? 8 : 0) + randomBetween(-2, 2),
      0,
      100
    );
    const rainRaw = rain ? randomBetween(210, 470) : randomBetween(610, 920);

    return {
      id: count - index,
      temperature: round(
        baseTemperature + wave * 1.8 + randomBetween(-0.6, 0.6)
      ),
      humidity: round(
        clamp(
          baseHumidity - wave * 3 + (rain ? 7 : 0) + randomBetween(-2, 2),
          0,
          100
        )
      ),
      soilMoisture: round(soilMoisture),
      soilRaw: round(1023 - soilMoisture * 8.2, 0),
      rain,
      rainRaw: round(rainRaw, 0),
      fire,
      timestamp: new Date(now - newestFirstIndex * 5 * 60 * 1000).toISOString(),
    };
  });
}
