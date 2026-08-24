const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const publicEnvConfig = {
  NEXT_PUBLIC_DATA_SIZE: parseNumber(process.env.NEXT_PUBLIC_DATA_SIZE, 24),
  NEXT_PUBLIC_DEMO_API: process.env.NEXT_PUBLIC_DEMO_API === 'true',
  NEXT_PUBLIC_WEATHER_REFRESH_INTERVAL: parseNumber(
    process.env.NEXT_PUBLIC_WEATHER_REFRESH_INTERVAL,
    5000
  ),
  NEXT_PUBLIC_WEATHER_REFRESH_ENABLED:
    process.env.NEXT_PUBLIC_WEATHER_REFRESH_ENABLED !== 'false',
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export default publicEnvConfig;
