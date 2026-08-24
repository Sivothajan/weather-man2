import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { sendSensorAlert } from '@/services/notifications.service';
import type { WeatherReading } from '@/types/weather';

const booleanishSchema = z
  .union([z.boolean(), z.number(), z.string()])
  .transform((value, context) => {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 0) {
        return false;
      }

      if (value === 1) {
        return true;
      }
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (['true', '1', 'yes', 'y'].includes(normalized)) {
        return true;
      }

      if (['false', '0', 'no', 'n'].includes(normalized)) {
        return false;
      }
    }

    context.addIssue({
      code: 'custom',
      message: 'Expected a boolean, 0/1, true/false, yes/no value',
    });

    return z.NEVER;
  });

export const createWeatherReadingSchema = z.object({
  temperature: z.coerce.number().finite(),
  humidity: z.coerce.number().finite(),
  soilMoisture: z.coerce.number().finite(),
  soilRaw: z.coerce.number().finite().optional().nullable(),
  rain: booleanishSchema,
  rainRaw: z.coerce.number().finite().optional().nullable(),
  fire: booleanishSchema,
  timestamp: z.coerce.date().optional(),
});

const limitSchema = z.coerce.number().int().min(1).max(500).default(24);

type PrismaWeatherReading = {
  id: number;
  stationId: string;
  station: {
    stationCode: string;
    name: string;
  };
  temperature: number;
  humidity: number;
  soilMoisture: number;
  soilRaw: number | null;
  rain: boolean;
  rainRaw: number | null;
  fire: boolean;
  timestamp: Date;
};

function toWeatherReading(reading: PrismaWeatherReading): WeatherReading {
  return {
    id: reading.id,
    stationId: reading.stationId,
    stationCode: reading.station.stationCode,
    stationName: reading.station.name,
    temperature: reading.temperature,
    humidity: reading.humidity,
    soilMoisture: reading.soilMoisture,
    soilRaw: reading.soilRaw,
    rain: reading.rain,
    rainRaw: reading.rainRaw,
    fire: reading.fire,
    timestamp: reading.timestamp.toISOString(),
  };
}

export function parseReadingLimit(value: string | null) {
  return limitSchema.parse(value ?? undefined);
}

type RecentReadingOptions = {
  includePrivate?: boolean;
};

export async function getRecentWeatherReadings(
  limit = 24,
  stationCode?: string,
  options: RecentReadingOptions = {}
) {
  const take = limitSchema.parse(limit);
  const readings = await prisma.weatherReading.findMany({
    where: {
      station: {
        ...(stationCode && stationCode !== 'all' ? { stationCode } : {}),
        ...(options.includePrivate ? {} : { isActive: true, isPublic: true }),
      },
    },
    include: {
      station: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take,
  });

  return readings.map(toWeatherReading);
}

export async function createWeatherReading(input: unknown, stationId: string) {
  const reading = createWeatherReadingSchema.parse(input);
  const created = await prisma.weatherReading.create({
    data: {
      stationId,
      temperature: reading.temperature,
      humidity: reading.humidity,
      soilMoisture: reading.soilMoisture,
      soilRaw: reading.soilRaw,
      rain: reading.rain,
      rainRaw: reading.rainRaw,
      fire: reading.fire,
      timestamp: reading.timestamp,
    },
    include: {
      station: true,
    },
  });

  const alerts = await Promise.all([
    reading.rain
      ? sendSensorAlert(
          `Rain detected at ${created.station.name}`,
          `Rain sensor triggered at ${created.station.name} on ${created.timestamp.toISOString()}${
            reading.rainRaw == null ? '' : ` with raw value ${reading.rainRaw}`
          }.`
        )
      : Promise.resolve({
          status: 'skipped',
          reason: 'rain is false',
        } as const),
    reading.fire
      ? sendSensorAlert(
          `Fire detected at ${created.station.name}`,
          `Fire sensor triggered at ${created.station.name} on ${created.timestamp.toISOString()}. Immediate attention required.`
        )
      : Promise.resolve({
          status: 'skipped',
          reason: 'fire is false',
        } as const),
  ]);

  return {
    reading: toWeatherReading(created),
    alerts,
  };
}
