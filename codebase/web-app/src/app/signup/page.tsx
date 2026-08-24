import { UserPlus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import serverEnvConfig from '@/config/server.env.config';
import { signUpAction } from '@/server/auth/actions';
import { ensureDemoAuthAccounts } from '@/services/demo-auth.service';
import { AuthShell } from '@/views/auth/AuthShell';
import { GoogleSignInButton } from '@/views/auth/GoogleSignInButton';

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  await ensureDemoAuthAccounts();

  const params = await searchParams;
  const googleConfigured = Boolean(
    serverEnvConfig.GOOGLE_CLIENT_ID && serverEnvConfig.GOOGLE_CLIENT_SECRET
  );

  return (
    <AuthShell
      description="Create an admin account for station management."
      message={
        params.error ||
        (!serverEnvConfig.AUTH_SIGNUP_ENABLED
          ? 'Signup is currently disabled by configuration.'
          : undefined)
      }
      messageType="error"
      title="Sign up"
    >
      {serverEnvConfig.AUTH_SIGNUP_ENABLED ? (
        <form action={signUpAction} className="space-y-4">
          <Label className="flex w-full flex-col items-start gap-1.5">
            Name
            <Input name="name" type="text" />
          </Label>
          <Label className="flex w-full flex-col items-start gap-1.5">
            Email
            <Input name="email" required type="email" />
          </Label>
          <Label className="flex w-full flex-col items-start gap-1.5">
            Password
            <Input minLength={8} name="password" required type="password" />
          </Label>
          <Button className="w-full" type="submit">
            <UserPlus className="size-4" />
            Create account
          </Button>
        </form>
      ) : null}

      {serverEnvConfig.AUTH_SIGNUP_ENABLED ? (
        <GoogleSignInButton configured={googleConfigured} />
      ) : null}

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link className="text-foreground hover:underline" href="/signin">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
