import { demoAuthAccounts } from '@/services/demo-auth.service';

export function DemoAuthHint() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
      <p className="mb-2 font-medium">Demo sign-in accounts</p>
      <div className="grid gap-2">
        {demoAuthAccounts.map((account) => (
          <pre
            className="overflow-x-auto rounded-md bg-background p-2 font-mono text-xs text-muted-foreground"
            key={account.email}
          >
            {account.name}
            {'\n'}email={account.email}
            {'\n'}password={account.password}
          </pre>
        ))}
      </div>
    </div>
  );
}
