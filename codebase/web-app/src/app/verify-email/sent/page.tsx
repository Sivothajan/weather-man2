import { MailCheck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resendVerificationAction } from '@/server/auth/actions';
import { AuthShell } from '@/views/auth/AuthShell';

type VerifyEmailSentPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const statusMessages: Record<string, string> = {
  invalid: 'Verification link is invalid or expired.',
  missing: 'Verification token is missing.',
  sent: 'Check your inbox for a verification link.',
  verified: 'Email verified. You can continue to admin.',
};

export default async function VerifyEmailSentPage({
  searchParams,
}: VerifyEmailSentPageProps) {
  const params = await searchParams;
  const status = params.status || 'sent';

  return (
    <AuthShell
      description="Email verification is required before admin access."
      message={statusMessages[status] ?? statusMessages.sent}
      messageType={
        status === 'invalid' || status === 'missing' ? 'error' : 'status'
      }
      title="Verify email"
    >
      <div className="space-y-3">
        <form action={resendVerificationAction} className="space-y-3">
          <Label className="flex w-full flex-col items-start gap-1.5">
            Email
            <Input name="email" required type="email" />
          </Label>
          <Button className="w-full" type="submit" variant="outline">
            <MailCheck className="size-4" />
            Resend verification
          </Button>
        </form>
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href="/admin/stations" />}
        >
          Continue
        </Button>
      </div>
    </AuthShell>
  );
}
