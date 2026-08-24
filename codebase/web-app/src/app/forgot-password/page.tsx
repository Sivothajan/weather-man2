import { KeyRound } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordAction } from '@/server/auth/actions';
import { AuthShell } from '@/views/auth/AuthShell';

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    status?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const message = params.error || params.status;

  return (
    <AuthShell
      description="Request a one-time password reset link."
      message={message}
      messageType={params.error ? 'error' : 'status'}
      title="Reset password"
    >
      <form action={forgotPasswordAction} className="space-y-4">
        <Label className="flex w-full flex-col items-start gap-1.5">
          Email
          <Input name="email" required type="email" />
        </Label>
        <Button className="w-full" type="submit">
          <KeyRound className="size-4" />
          Send reset link
        </Button>
      </form>
      <Link
        className="text-sm text-muted-foreground hover:text-foreground"
        href="/signin"
      >
        Back to sign in
      </Link>
    </AuthShell>
  );
}
