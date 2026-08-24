export type WeatherReading = {
  id: number;
  stationId: string;
  stationCode: string;
  stationName: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  soilRaw: number | null;
  rain: boolean;
  rainRaw: number | null;
  fire: boolean;
  timestamp: string;
};

export type ReadingApiResponse = {
  data: WeatherReading[];
  meta: {
    count: number;
    demo?: boolean;
    limit: number;
    station?: string;
  };
};

export type WeatherStationSummary = {
  id: string;
  stationCode: string;
  name: string;
  location: string | null;
  isActive: boolean;
  isPublic: boolean;
  refreshIntervalMs: number;
};

export type DemoPrivateStationCredential = {
  stationCode: string;
  name: string;
  apiKey: string;
  refreshIntervalMs: number;
};
