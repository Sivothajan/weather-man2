import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { generateStationApiKey, hashToken } from '@/server/auth/crypto';

const stationCodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Use lowercase letters, numbers, and single hyphens.',
  });

const stationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  stationCode: stationCodeSchema,
  location: z.string().trim().max(160).optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.coerce.boolean().optional(),
  isPublic: z.coerce.boolean().optional(),
  refreshIntervalMs: z.coerce.number().int().min(1000).max(300000).optional(),
});

const stationUpdateSchema = stationSchema.omit({
  stationCode: true,
});

const stationApiKeySchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export type StationVisibilityFilter = 'all' | 'private' | 'public';

export async function getStations(visibility: StationVisibilityFilter = 'all') {
  const stations = await prisma.weatherStation.findMany({
    where:
      visibility === 'all'
        ? undefined
        : {
            isPublic: visibility === 'public',
          },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      apiKeys: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      readings: {
        orderBy: {
          timestamp: 'desc',
        },
        take: 1,
      },
    },
  });

  return stations.map((station) => ({
    ...station,
    latestReading: station.readings[0] ?? null,
    latestKeyUse:
      station.apiKeys
        .map((key) => key.lastUsedAt)
        .filter((lastUsedAt): lastUsedAt is Date => Boolean(lastUsedAt))
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null,
  }));
}

export async function getPublicStations() {
  return prisma.weatherStation.findMany({
    where: {
      isActive: true,
      isPublic: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      stationCode: true,
      name: true,
      location: true,
      isActive: true,
      isPublic: true,
      refreshIntervalMs: true,
    },
  });
}

export async function findStationSummary(identifier: string) {
  return prisma.weatherStation.findFirst({
    where: {
      OR: [
        {
          stationCode: identifier,
        },
        {
          name: identifier,
        },
      ],
    },
    select: {
      id: true,
      stationCode: true,
      name: true,
      location: true,
      isActive: true,
      isPublic: true,
      refreshIntervalMs: true,
    },
  });
}

export async function getStation(stationId: string) {
  return prisma.weatherStation.findUnique({
    where: {
      id: stationId,
    },
    include: {
      apiKeys: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      readings: {
        orderBy: {
          timestamp: 'desc',
        },
        take: 24,
      },
    },
  });
}

export async function createStation(input: unknown) {
  const data = stationSchema.parse(input);

  return prisma.weatherStation.create({
    data: {
      name: data.name,
      stationCode: data.stationCode,
      location: data.location || undefined,
      description: data.description || undefined,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? true,
      refreshIntervalMs: data.refreshIntervalMs ?? 5000,
    },
  });
}

export async function updateStation(stationId: string, input: unknown) {
  const data = stationUpdateSchema.parse(input);

  return prisma.weatherStation.update({
    where: {
      id: stationId,
    },
    data: {
      name: data.name,
      location: data.location || null,
      description: data.description || null,
      isActive: data.isActive ?? false,
      isPublic: data.isPublic ?? false,
      refreshIntervalMs: data.refreshIntervalMs ?? 5000,
    },
  });
}

export async function createStationApiKey(stationId: string, input: unknown) {
  const data = stationApiKeySchema.parse(input);
  const apiKey = generateStationApiKey();

  const created = await prisma.stationApiKey.create({
    data: {
      stationId,
      name: data.name,
      keyHash: hashToken(apiKey),
      keyPrefix: apiKey.slice(0, 12),
    },
  });

  return {
    apiKey,
    record: created,
  };
}

export async function revokeStationApiKey(keyId: string) {
  return prisma.stationApiKey.update({
    where: {
      id: keyId,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function deleteRevokedStationApiKey(keyId: string) {
  const key = await prisma.stationApiKey.findUnique({
    where: {
      id: keyId,
    },
    select: {
      revokedAt: true,
    },
  });

  if (!key?.revokedAt) {
    throw new Error('Only revoked API keys can be deleted.');
  }

  return prisma.stationApiKey.delete({
    where: {
      id: keyId,
    },
  });
}

export async function verifyStationCredentials(
  stationCode: string | null,
  apiKey: string | null
) {
  if (!stationCode || !apiKey) {
    return null;
  }

  const station = await prisma.weatherStation.findUnique({
    where: {
      stationCode,
    },
    include: {
      apiKeys: {
        where: {
          keyHash: hashToken(apiKey),
          revokedAt: null,
        },
        take: 1,
      },
    },
  });

  const key = station?.apiKeys[0];

  if (!station?.isActive || !key) {
    return null;
  }

  await prisma.stationApiKey.update({
    where: {
      id: key.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return station;
}
