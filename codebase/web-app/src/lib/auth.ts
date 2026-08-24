import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

import serverEnvConfig from '@/config/server.env.config';
import { prisma } from '@/lib/prisma';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '@/server/auth/email';

export const auth = betterAuth({
  baseURL: serverEnvConfig.APP_BASE_URL,
  secret: serverEnvConfig.AUTH_SECRET || undefined,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  advanced: {
    database: {
      joins: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ['ADMIN', 'VIEWER'],
        required: false,
        defaultValue: 'VIEWER',
        input: false,
      },
    },
    changeEmail: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!serverEnvConfig.AUTH_SIGNUP_ENABLED) {
            return false;
          }

          const userCount = await prisma.user.count();

          return {
            data: {
              ...user,
              role: userCount === 0 ? 'ADMIN' : 'VIEWER',
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: !serverEnvConfig.AUTH_SIGNUP_ENABLED,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail(user.email, url);
    },
  },
  socialProviders:
    serverEnvConfig.GOOGLE_CLIENT_ID && serverEnvConfig.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: serverEnvConfig.GOOGLE_CLIENT_ID,
            clientSecret: serverEnvConfig.GOOGLE_CLIENT_SECRET,
            disableSignUp: !serverEnvConfig.AUTH_SIGNUP_ENABLED,
            requireEmailVerification: true,
          },
        }
      : undefined,
  plugins: [nextCookies()],
});
