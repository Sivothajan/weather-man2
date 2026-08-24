import { hashPassword } from 'better-auth/crypto';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

import publicEnvConfig from '@/config/public.env.config';
import serverEnvConfig from '@/config/server.env.config';
import { prisma } from '@/lib/prisma';

const DEMO_AUTH_COOKIE = 'weather_man_demo_session';

export const demoAuthAccounts = [
  {
    id: 'demo_admin_user',
    name: 'Demo Admin',
    email: 'admin@weather-man.demo',
    password: 'DemoAdmin123!',
    role: 'ADMIN' as const,
  },
  {
    id: 'demo_viewer_user',
    name: 'Demo Viewer',
    email: 'viewer@weather-man.demo',
    password: 'DemoViewer123!',
    role: 'VIEWER' as const,
  },
];

function isDemoAuthEnabled() {
  return publicEnvConfig.NEXT_PUBLIC_DEMO_API || !process.env.DATABASE_URL;
}

function signDemoPayload(payload: string) {
  return createHmac('sha256', serverEnvConfig.AUTH_SECRET)
    .update(payload)
    .digest('base64url');
}

function encodeDemoToken(account: (typeof demoAuthAccounts)[number]) {
  const payload = Buffer.from(
    JSON.stringify({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    })
  ).toString('base64url');

  return `${payload}.${signDemoPayload(payload)}`;
}

function decodeDemoToken(token: string) {
  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expected = signDemoPayload(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'VIEWER';
    };
  } catch {
    return null;
  }
}

export function getDemoAccountByCredentials(email: string, password: string) {
  if (!isDemoAuthEnabled()) {
    return undefined;
  }

  return demoAuthAccounts.find(
    (account) => account.email === email && account.password === password
  );
}

export async function createDemoSession(
  account: (typeof demoAuthAccounts)[number]
) {
  const cookieStore = await cookies();

  cookieStore.set(DEMO_AUTH_COOKIE, encodeDemoToken(account), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function clearDemoSession() {
  const cookieStore = await cookies();

  cookieStore.delete(DEMO_AUTH_COOKIE);
}

export async function getDemoSessionUser() {
  if (!isDemoAuthEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_AUTH_COOKIE)?.value;

  return token ? decodeDemoToken(token) : null;
}

export async function ensureDemoAuthAccounts() {
  if (!isDemoAuthEnabled()) {
    return;
  }

  try {
    await Promise.all(
      demoAuthAccounts.map(async (account) => {
        await prisma.user.upsert({
          where: {
            email: account.email,
          },
          update: {
            name: account.name,
            emailVerified: true,
            role: account.role,
          },
          create: {
            id: account.id,
            name: account.name,
            email: account.email,
            emailVerified: true,
            role: account.role,
          },
        });

        const existingCredential = await prisma.account.findUnique({
          where: {
            issuer_accountId: {
              issuer: 'local:credential',
              accountId: account.id,
            },
          },
        });

        if (existingCredential) {
          return;
        }

        await prisma.account.create({
          data: {
            userId: account.id,
            issuer: 'local:credential',
            providerId: 'credential',
            accountId: account.id,
            password: await hashPassword(account.password),
          },
        });
      })
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('DATABASE_URL is not defined')
    ) {
      console.warn(
        'Demo auth accounts were not seeded because DATABASE_URL is not defined.'
      );
      return;
    }

    throw error;
  }
}
