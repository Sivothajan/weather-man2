import type {
  DemoPrivateStationCredential,
  WeatherReading,
  WeatherStationSummary,
} from '@/types/weather';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round = (value: number, precision = 1) => {
  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
};

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

function getDemoWeatherStations(): WeatherStationSummary[] {
  return [
    {
      id: 'demo-main',
      stationCode: 'main-station',
      name: 'Main Station',
      location: 'Garden',
      isActive: true,
      isPublic: true,
      refreshIntervalMs: 5000,
    },
    {
      id: 'demo-roof',
      stationCode: 'roof-station',
      name: 'Roof Station',
      location: 'Roof deck',
      isActive: true,
      isPublic: true,
      refreshIntervalMs: 7000,
    },
    {
      id: 'demo-greenhouse',
      stationCode: 'greenhouse-station',
      name: 'Greenhouse Station',
      location: 'Greenhouse',
      isActive: true,
      isPublic: true,
      refreshIntervalMs: 3000,
    },
    {
      id: 'demo-field',
      stationCode: 'field-station',
      name: 'Field Station',
      location: 'Open field',
      isActive: true,
      isPublic: true,
      refreshIntervalMs: 10000,
    },
    {
      id: 'demo-lab',
      stationCode: 'lab-station',
      name: 'Lab Station',
      location: 'Sensor lab',
      isActive: true,
      isPublic: false,
      refreshIntervalMs: 2500,
    },
    {
      id: 'demo-storage',
      stationCode: 'storage-station',
      name: 'Storage Station',
      location: 'Storage room',
      isActive: true,
      isPublic: false,
      refreshIntervalMs: 12000,
    },
  ];
}

export function getDemoPublicWeatherStations() {
  return getDemoWeatherStations().filter((station) => station.isPublic);
}

export function getDemoPrivateStationCredentials(): DemoPrivateStationCredential[] {
  return getDemoStationCredentials().filter((station) => !station.isPublic);
}

export function getDemoStationCredentials() {
  return getDemoWeatherStations().map((station) => ({
    stationCode: station.stationCode,
    name: station.name,
    apiKey: `wm_demo_${station.stationCode.replaceAll('-', '_')}_key`,
    refreshIntervalMs: station.refreshIntervalMs,
    isPublic: station.isPublic,
  }));
}

export function findDemoWeatherStation(identifier: string) {
  const normalized = identifier.trim();

  return getDemoWeatherStations().find(
    (station) =>
      station.stationCode === normalized || station.name === normalized
  );
}

export function verifyDemoStationApiKey(
  stationCode: string,
  apiKey: string | null
) {
  return getDemoStationCredentials().some(
    (station) =>
      station.stationCode === stationCode && station.apiKey === apiKey
  );
}

export type DemoStationVisibilityFilter = 'all' | 'private' | 'public';

export function getDemoAdminStations(
  visibility: DemoStationVisibilityFilter = 'all'
) {
  const createdAt = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const updatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return getDemoWeatherStations()
    .filter((station) => {
      if (visibility === 'all') {
        return true;
      }

      return visibility === 'public' ? station.isPublic : !station.isPublic;
    })
    .map((station, stationIndex) => {
      const credential = getDemoStationCredentials().find(
        (item) => item.stationCode === station.stationCode
      );
      const readings = getDemoWeatherReadings(24, station.stationCode).map(
        (reading) => ({
          ...reading,
          timestamp: new Date(reading.timestamp),
        })
      );

      return {
        ...station,
        description: station.isPublic
          ? 'Public demo station visible in the Live Station Monitor.'
          : 'Private demo station visible only in admin or with its dummy API key.',
        createdAt,
        updatedAt,
        apiKeys: credential
          ? [
              {
                id: `${station.id}-demo-key`,
                stationId: station.id,
                name: `${station.name} demo key`,
                keyHash: 'demo-key-hash',
                keyPrefix: credential.apiKey.slice(0, 12),
                lastUsedAt: station.isPublic
                  ? null
                  : new Date(Date.now() - (stationIndex + 1) * 9 * 60 * 1000),
                revokedAt: null,
                createdAt,
              },
            ]
          : [],
        readings,
        latestReading: readings[0] ?? null,
        latestKeyUse: station.isPublic
          ? null
          : new Date(Date.now() - (stationIndex + 1) * 9 * 60 * 1000),
      };
    });
}

export function getDemoAdminStation(identifier: string) {
  return getDemoAdminStations('all').find(
    (station) =>
      station.id === identifier ||
      station.stationCode === identifier ||
      station.name === identifier
  );
}

export function getDemoWeatherReadings(
  limit = 24,
  stationCode = 'main-station'
): WeatherReading[] {
  const count = clamp(Math.trunc(limit), 1, 500);
  const demoStations = getDemoPublicWeatherStations();
  const allDemoStations = getDemoWeatherStations();
  const selectedStations =
    stationCode === 'all'
      ? demoStations
      : [
          allDemoStations.find((item) => item.stationCode === stationCode) ??
            demoStations[0],
        ];
  const now = Date.now();
  const baseTemperature = randomBetween(24, 31);
  const baseHumidity = randomBetween(58, 82);
  const baseSoilMoisture = randomBetween(35, 68);
  const isRainyRun = true;
  const hasFireSpike = Math.random() > 0.92;

  return Array.from({ length: count }, (_, index) => {
    const station = selectedStations[index % selectedStations.length];
    const newestFirstIndex = index;
    const trendIndex = count - newestFirstIndex;
    const stationOffset = selectedStations.findIndex(
      (item) => item.stationCode === station.stationCode
    );
    const wave = Math.sin(trendIndex / 3);
    const rain =
      isRainyRun &&
      newestFirstIndex < 5 &&
      station.stationCode !== 'roof-station';
    const fire =
      hasFireSpike &&
      newestFirstIndex === 0 &&
      station.stationCode === 'greenhouse-station';
    const soilMoisture = clamp(
      baseSoilMoisture +
        stationOffset * 3 +
        wave * 4 +
        (rain ? 8 : 0) +
        randomBetween(-2, 2),
      0,
      100
    );
    const rainRaw = rain ? randomBetween(210, 470) : randomBetween(610, 920);

    return {
      id: count - index,
      stationId: station.id,
      stationCode: station.stationCode,
      stationName: station.name,
      temperature: round(
        baseTemperature +
          stationOffset * 0.7 +
          wave * 1.8 +
          randomBetween(-0.6, 0.6)
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
