import PageState from '@/views/shared/PageState';

export default function UnauthorizedPage() {
  return (
    <PageState
      actionHref="/"
      actionLabel="Go home"
      message="Your account is signed in, but it does not have admin access."
      title="Unauthorized"
    />
  );
}
