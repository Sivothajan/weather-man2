'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

type GoogleSignInButtonProps = {
  configured?: boolean;
};

export function GoogleSignInButton({
  configured = true,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="w-full"
      disabled={!configured || loading}
      onClick={async () => {
        if (!configured) {
          return;
        }

        setLoading(true);
        await authClient.signIn.social({
          provider: 'google',
          callbackURL: '/admin/stations',
        });
        setLoading(false);
      }}
      type="button"
      variant="outline"
    >
      {loading
        ? 'Opening Google...'
        : configured
          ? 'Continue with Google'
          : 'Google OAuth not configured'}
    </Button>
  );
}
