import { Button } from '@/components/ui/button';

type PageStateProps = {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function PageState({
  title,
  message,
  actionHref,
  actionLabel = 'Try again',
  onAction,
}: PageStateProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-16 sm:px-6">
      <div className="max-w-2xl space-y-4">
        <p className="font-mono text-sm uppercase text-muted-foreground">
          The Weather Man
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground">{message}</p>
        {actionHref ? (
          <Button
            nativeButton={false}
            render={<a href={actionHref} />}
            variant="outline"
          >
            {actionLabel}
          </Button>
        ) : null}
        {onAction ? (
          <Button className="w-fit" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </main>
  );
}
