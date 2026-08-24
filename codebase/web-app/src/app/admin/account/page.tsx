import { Mail, Save, Send, ShieldCheck, UserRound } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  changeAccountEmailAction,
  updateAccountProfileAction,
} from '@/server/auth/actions';
import { requireAdminUser } from '@/server/auth/session';

export const dynamic = 'force-dynamic';

type AccountPageProps = {
  searchParams: Promise<{
    error?: string;
    status?: string;
  }>;
};

const statusMessages: Record<string, string> = {
  'email-updated': 'Email updated.',
  'email-verification-sent': 'Verification email sent to the new address.',
  'profile-updated': 'Profile updated.',
};

function isDemoUser(userId: string) {
  return userId.startsWith('demo_');
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [user, query] = await Promise.all([requireAdminUser(), searchParams]);
  const isDemoAccount = isDemoUser(user.id) || !process.env.DATABASE_URL;
  const message =
    query.error ||
    (query.status ? statusMessages[query.status] || query.status : '');

  return (
    <section className="w-full space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your admin profile and sign-in email.
          </p>
        </div>
        <Badge className="w-fit" variant="secondary">
          <ShieldCheck className="size-3.5" />
          {user.role}
        </Badge>
      </div>

      {message ? (
        <Alert variant={query.error ? 'destructive' : 'default'}>
          <AlertTitle>
            {query.error ? 'Account update failed' : 'Account'}
          </AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {isDemoAccount ? (
        <Alert>
          <AlertTitle>Demo account</AlertTitle>
          <AlertDescription>
            Demo sessions are read-only. Use a configured database account to
            update profile details or change email.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4" />
              Profile
            </CardTitle>
            <CardDescription>
              This name is shown in admin sessions and account metadata.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateAccountProfileAction} className="space-y-4">
              <Label className="flex w-full flex-col items-start gap-1.5">
                Name
                <Input
                  defaultValue={user.name}
                  disabled={isDemoAccount}
                  name="name"
                  required
                />
              </Label>
              <Label className="flex w-full flex-col items-start gap-1.5">
                Image URL
                <Input
                  defaultValue={user.image ?? ''}
                  disabled={isDemoAccount}
                  name="image"
                  placeholder="https://example.com/avatar.png"
                  type="url"
                />
              </Label>
              <Button disabled={isDemoAccount} type="submit">
                <Save className="size-4" />
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4" />
                Email
              </CardTitle>
              <CardDescription>
                Changing email sends a verification link before the new address
                becomes active.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={changeAccountEmailAction} className="space-y-4">
                <Label className="flex w-full flex-col items-start gap-1.5">
                  Current email
                  <Input defaultValue={user.email} disabled />
                </Label>
                <Label className="flex w-full flex-col items-start gap-1.5">
                  New email
                  <Input
                    disabled={isDemoAccount}
                    name="newEmail"
                    required
                    type="email"
                  />
                </Label>
                <Button
                  className="w-full"
                  disabled={isDemoAccount}
                  type="submit"
                  variant="outline"
                >
                  <Send className="size-4" />
                  Send verification
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access</CardTitle>
              <CardDescription>Current account state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Email verified</span>
                <Badge
                  variant={user.emailVerified ? 'secondary' : 'destructive'}
                >
                  {user.emailVerified ? 'Verified' : 'Required'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
