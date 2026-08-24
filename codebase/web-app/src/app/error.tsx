'use client';

import { useEffect } from 'react';

import PageState from '@/views/shared/PageState';

const errorTitle = 'Application Error | The Weather Man';
const errorDescription = 'The Weather Man dashboard hit an unexpected issue.';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    const previousDescription = descriptionMeta?.getAttribute('content');

    document.title = errorTitle;

    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', errorDescription);
    }

    return () => {
      document.title = previousTitle;
      if (descriptionMeta && previousDescription) {
        descriptionMeta.setAttribute('content', previousDescription);
      }
    };
  }, []);

  return (
    <PageState
      title="Weather data stalled"
      message={error.message || 'The dashboard hit an unexpected issue.'}
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
