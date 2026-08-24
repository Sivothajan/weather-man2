import { CloudSun } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type AuthShellProps = {
  children: ReactNode;
  description: string;
  message?: string;
  messageType?: 'error' | 'status';
  title: string;
};

export function AuthShell({
  children,
  description,
  message,
  messageType = 'status',
  title,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-5 px-4 py-16 sm:px-6">
      <Link className="w-fit" href="/">
        <Badge variant="secondary">
          <CloudSun className="size-3.5" />
          The Weather Man
        </Badge>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <div
              className={
                messageType === 'error'
                  ? 'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'
                  : 'rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground'
              }
            >
              {message}
            </div>
          ) : null}
          {children}
        </CardContent>
      </Card>
    </main>
  );
}
