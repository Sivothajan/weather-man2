import { CloudSun, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import publicEnvConfig from '@/config/public.env.config';
import { signOutAction } from '@/server/auth/actions';
import { requireAdminUser } from '@/server/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdminUser();
  const demoAvailable =
    publicEnvConfig.NEXT_PUBLIC_DEMO_API || !process.env.DATABASE_URL;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-20 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Link className="w-fit" href="/">
            <Badge variant="secondary">
              <CloudSun className="size-3.5" />
              The Weather Man
            </Badge>
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard" />}
            variant="outline"
          >
            Live Monitor
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/admin/stations" />}
            variant="outline"
          >
            Stations
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/admin/account" />}
            variant="outline"
          >
            <UserRound className="size-4" />
            Account
          </Button>
          {demoAvailable ? (
            <Button
              nativeButton={false}
              render={<Link href="/admin/demo-stations" />}
              variant="outline"
            >
              Demo Stations
            </Button>
          ) : null}
          <form action={signOutAction}>
            <Button type="submit" variant="ghost">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </nav>
      </header>
      {children}
    </main>
  );
}
