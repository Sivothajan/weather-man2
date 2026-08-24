import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type VerifyEmailPageProps = {
  searchParams: Promise<{
    callbackURL?: string;
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();

  if (query.token) {
    params.set('token', query.token);
  }

  if (query.callbackURL) {
    params.set('callbackURL', query.callbackURL);
  }

  redirect(`/api/auth/verify-email?${params.toString()}`);
}
