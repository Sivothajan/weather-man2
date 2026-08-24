'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

import { requireAdminUser } from '@/server/auth/session';
import {
  createStation,
  createStationApiKey,
  deleteRevokedStationApiKey,
  revokeStationApiKey,
  updateStation,
} from '@/server/stations/service';

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function redirectWithError(path: string, error: unknown): never {
  const message =
    error instanceof ZodError
      ? (error.issues[0]?.message ?? 'Invalid form details.')
      : error instanceof Error
        ? error.message
        : 'Request failed.';
  const searchParams = new URLSearchParams({
    error: message,
  });

  redirect(`${path}?${searchParams.toString()}`);
}

function requireStationDatabase(path: string) {
  if (!process.env.DATABASE_URL) {
    redirectWithError(
      path,
      new Error('DATABASE_URL is required for station administration.')
    );
  }
}

export async function createStationAction(formData: FormData) {
  await requireAdminUser();
  requireStationDatabase('/admin/stations/new');

  let stationId: string;

  try {
    const station = await createStation(formDataToObject(formData));
    stationId = station.id;
    revalidatePath('/admin/stations');
  } catch (error) {
    redirectWithError('/admin/stations/new', error);
  }

  redirect(`/admin/stations/${stationId}`);
}

export async function updateStationAction(
  stationId: string,
  formData: FormData
) {
  await requireAdminUser();
  requireStationDatabase(`/admin/stations/${stationId}`);

  try {
    await updateStation(stationId, formDataToObject(formData));
    revalidatePath('/admin/stations');
    revalidatePath(`/admin/stations/${stationId}`);
  } catch (error) {
    redirectWithError(`/admin/stations/${stationId}`, error);
  }

  redirect(`/admin/stations/${stationId}?status=updated`);
}

export async function createStationApiKeyAction(
  stationId: string,
  formData: FormData
) {
  await requireAdminUser();
  requireStationDatabase(`/admin/stations/${stationId}/keys`);

  let apiKey: string;

  try {
    const result = await createStationApiKey(
      stationId,
      formDataToObject(formData)
    );
    apiKey = result.apiKey;

    revalidatePath(`/admin/stations/${stationId}/keys`);
  } catch (error) {
    redirectWithError(`/admin/stations/${stationId}/keys`, error);
  }

  const searchParams = new URLSearchParams({
    createdKey: apiKey,
  });

  redirect(`/admin/stations/${stationId}/keys?${searchParams.toString()}`);
}

export async function revokeStationApiKeyAction(
  stationId: string,
  keyId: string
) {
  await requireAdminUser();
  requireStationDatabase(`/admin/stations/${stationId}/keys`);
  await revokeStationApiKey(keyId);
  revalidatePath(`/admin/stations/${stationId}/keys`);
  redirect(`/admin/stations/${stationId}/keys?status=revoked`);
}

export async function deleteRevokedStationApiKeyAction(
  stationId: string,
  keyId: string
) {
  await requireAdminUser();
  requireStationDatabase(`/admin/stations/${stationId}/keys`);

  try {
    await deleteRevokedStationApiKey(keyId);
    revalidatePath(`/admin/stations/${stationId}/keys`);
  } catch (error) {
    redirectWithError(`/admin/stations/${stationId}/keys`, error);
  }

  redirect(`/admin/stations/${stationId}/keys?status=deleted`);
}
