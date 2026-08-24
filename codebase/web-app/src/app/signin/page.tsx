import { LogIn } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import serverEnvConfig from '@/config/server.env.config';
import { signInAction } from '@/server/auth/actions';
import { ensureDemoAuthAccounts } from '@/services/demo-auth.service';
import { AuthShell } from '@/views/auth/AuthShell';
import { GoogleSignInButton } from '@/views/auth/GoogleSignInButton';

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    status?: string;
  }>;
};

export const dynamic = 'force-dynamic';

const statusMessages: Record<string, string> = {
  'password-reset': 'Password updated. Sign in with the new password.',
};

const errorMessages: Record<string, string> = {
  google: 'Google sign in failed. Try again.',
  'google-not-configured': 'Google sign in is not configured yet.',
  'oauth-state': 'Google sign in expired. Start again.',
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  await ensureDemoAuthAccounts();

  const params = await searchParams;
  const message =
    params.error && errorMessages[params.error]
      ? errorMessages[params.error]
      : params.error || (params.status ? statusMessages[params.status] : '');
  const googleConfigured = Boolean(
    serverEnvConfig.GOOGLE_CLIENT_ID && serverEnvConfig.GOOGLE_CLIENT_SECRET
  );

  return (
    <AuthShell
      description="Access station administration with your account."
      message={message}
      messageType={params.error ? 'error' : 'status'}
      title="Sign in"
    >
      <form action={signInAction} className="space-y-4">
        <Label className="flex w-full flex-col items-start gap-1.5">
          Email
          <Input name="email" required type="email" />
        </Label>
        <Label className="flex w-full flex-col items-start gap-1.5">
          Password
          <Input name="password" required type="password" />
        </Label>
        <Button className="w-full" type="submit">
          <LogIn className="size-4" />
          Sign in
        </Button>
      </form>

      <GoogleSignInButton configured={googleConfigured} />

      <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/forgot-password">
          Forgot password?
        </Link>
        {serverEnvConfig.AUTH_SIGNUP_ENABLED ? (
          <Link className="hover:text-foreground" href="/signup">
            Create account
          </Link>
        ) : null}
      </div>
    </AuthShell>
  );
}
