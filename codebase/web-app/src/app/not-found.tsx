import type { Metadata } from 'next';

import { ErrorPageFlag } from '@/components/custom/theme/error-page-flag';
import { buildPageMetadata } from '@/config/site-metadata.config';
import PageState from '@/views/shared/PageState';

export const metadata: Metadata = buildPageMetadata({
  title: 'Page Not Found',
  description: 'The requested Weather Man page could not be found.',
  noIndex: true,
});

export default function NotFound() {
  return (
    <>
      <ErrorPageFlag />
      <PageState
        title="Page not found"
        message="The Weather Man does not have a page at this address."
        actionHref="/"
        actionLabel="Go home"
      />
    </>
  );
}
