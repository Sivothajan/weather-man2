'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import publicEnvConfig from '@/config/public.env.config';
import serverEnvConfig from '@/config/server.env.config';
import { auth } from '@/lib/auth';
import { getCurrentUser, requireAdminUser } from '@/server/auth/session';
import {
  clearDemoSession,
  createDemoSession,
  getDemoAccountByCredentials,
} from '@/services/demo-auth.service';

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === 'string' ? value : '';
}

function redirectWithMessage(
  path: string,
  key: 'error' | 'status',
  value: string
): never {
  const searchParams = new URLSearchParams({
    [key]: value,
  });

  redirect(`${path}?${searchParams.toString()}`);
}

function authErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication failed.';
}

function isDemoUser(userId: string) {
  return userId.startsWith('demo_');
}

export async function signUpAction(formData: FormData) {
  try {
    await auth.api.signUpEmail({
      body: {
        name: formValue(formData, 'name') || formValue(formData, 'email'),
        email: formValue(formData, 'email'),
        password: formValue(formData, 'password'),
        callbackURL: '/admin/stations',
      },
    });
  } catch (error) {
    redirectWithMessage('/signup', 'error', authErrorMessage(error));
  }

  redirectWithMessage('/verify-email/sent', 'status', 'sent');
}

export async function signInAction(formData: FormData) {
  const email = formValue(formData, 'email');
  const password = formValue(formData, 'password');
  const demoAccount = getDemoAccountByCredentials(email, password);

  if (demoAccount) {
    await createDemoSession(demoAccount);

    redirect(
      publicEnvConfig.NEXT_PUBLIC_DEMO_API || !process.env.DATABASE_URL
        ? '/admin/demo-stations'
        : '/admin/stations'
    );
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: '/admin/stations',
      },
      headers: await headers(),
    });
  } catch (error) {
    const message = authErrorMessage(error);

    if (message.toLowerCase().includes('verif')) {
      redirectWithMessage('/verify-email/sent', 'status', 'sent');
    }

    redirectWithMessage('/signin', 'error', message);
  }

  redirect('/admin/stations');
}

export async function signOutAction() {
  await clearDemoSession();

  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes('DATABASE_URL is not defined')
    ) {
      throw error;
    }
  }

  redirect('/signin');
}

export async function resendVerificationAction(formData: FormData) {
  const user = await getCurrentUser();
  const email = formValue(formData, 'email') || user?.email;

  if (email) {
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: '/admin/stations',
      },
    });
  }

  redirectWithMessage('/verify-email/sent', 'status', 'sent');
}

export async function forgotPasswordAction(formData: FormData) {
  try {
    await auth.api.requestPasswordReset({
      body: {
        email: formValue(formData, 'email'),
        redirectTo: new URL(
          '/reset-password',
          serverEnvConfig.APP_BASE_URL
        ).toString(),
      },
    });
  } catch {
    // Keep the response neutral to avoid account enumeration.
  }

  redirectWithMessage(
    '/forgot-password',
    'status',
    'If an account exists, a reset link has been sent.'
  );
}

export async function resetPasswordAction(formData: FormData) {
  try {
    await auth.api.resetPassword({
      body: {
        token: formValue(formData, 'token'),
        newPassword: formValue(formData, 'password'),
      },
    });
  } catch (error) {
    redirectWithMessage('/reset-password', 'error', authErrorMessage(error));
  }

  redirectWithMessage('/signin', 'status', 'password-reset');
}

export async function updateAccountProfileAction(formData: FormData) {
  const user = await requireAdminUser();

  if (!process.env.DATABASE_URL || isDemoUser(user.id)) {
    redirectWithMessage(
      '/admin/account',
      'error',
      'Demo account profiles cannot be edited.'
    );
  }

  const name = formValue(formData, 'name').trim();
  const image = formValue(formData, 'image').trim();

  if (!name) {
    redirectWithMessage('/admin/account', 'error', 'Name is required.');
  }

  try {
    await auth.api.updateUser({
      body: {
        name,
        image: image || null,
      },
      headers: await headers(),
    });
  } catch (error) {
    redirectWithMessage('/admin/account', 'error', authErrorMessage(error));
  }

  redirectWithMessage('/admin/account', 'status', 'profile-updated');
}

export async function changeAccountEmailAction(formData: FormData) {
  const user = await requireAdminUser();

  if (!process.env.DATABASE_URL || isDemoUser(user.id)) {
    redirectWithMessage(
      '/admin/account',
      'error',
      'Demo account email cannot be changed.'
    );
  }

  const newEmail = formValue(formData, 'newEmail').trim().toLowerCase();

  if (!newEmail) {
    redirectWithMessage('/admin/account', 'error', 'New email is required.');
  }

  if (newEmail === user.email.toLowerCase()) {
    redirectWithMessage(
      '/admin/account',
      'error',
      'New email must be different from the current email.'
    );
  }

  try {
    await auth.api.changeEmail({
      body: {
        newEmail,
        callbackURL: '/admin/account?status=email-updated',
      },
      headers: await headers(),
    });
  } catch (error) {
    redirectWithMessage('/admin/account', 'error', authErrorMessage(error));
  }

  redirectWithMessage('/admin/account', 'status', 'email-verification-sent');
}
