import { KeyRound } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordAction } from '@/server/auth/actions';
import { AuthShell } from '@/views/auth/AuthShell';

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      description="Choose a new password for your account."
      message={params.error}
      messageType="error"
      title="New password"
    >
      {params.token ? (
        <form action={resetPasswordAction} className="space-y-4">
          <input name="token" type="hidden" value={params.token} />
          <Label className="flex w-full flex-col items-start gap-1.5">
            New password
            <Input minLength={8} name="password" required type="password" />
          </Label>
          <Button className="w-full" type="submit">
            <KeyRound className="size-4" />
            Update password
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Reset token is missing. Request a new password reset email.
        </p>
      )}
      <Link
        className="text-sm text-muted-foreground hover:text-foreground"
        href="/forgot-password"
      >
        Request another link
      </Link>
    </AuthShell>
  );
}
