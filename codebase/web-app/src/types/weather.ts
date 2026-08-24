export type WeatherReading = {
  id: number;
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
  };
};
