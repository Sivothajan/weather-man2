import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getDemoSessionUser } from '@/services/demo-auth.service';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: 'ADMIN' | 'VIEWER';
  emailVerified: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const demoUser = await getDemoSessionUser();

  if (demoUser) {
    return {
      ...demoUser,
      emailVerified: true,
    };
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const user = session.user as typeof session.user & {
    image?: string | null;
    role?: 'ADMIN' | 'VIEWER';
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role ?? 'VIEWER',
    emailVerified: user.emailVerified,
  };
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  if (!user.emailVerified) {
    redirect('/verify-email/sent');
  }

  if (user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return user;
}
