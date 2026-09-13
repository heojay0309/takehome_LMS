'use client';

import { Show, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { LoadingState } from '@/components/ui/loading-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function UserNav({ compact = false }: { compact?: boolean }) {
  const { isLoaded } = useUser();
  const loading = <LoadingState label="Loading account" className="flex min-h-12 items-center gap-4">
    <Skeleton className="size-12 shrink-0 rounded-full" />
    {!compact && <Skeleton className="h-8 w-28" />}
  </LoadingState>;
  if (!isLoaded) return loading;

  return (
    <div className={compact ? 'flex min-h-12 shrink-0 items-center' : 'flex min-h-12 w-full min-w-0 items-center gap-4'}>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <Button variant="outline" size="sm" className="w-full">
            Sign in
          </Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          showName={!compact}
          fallback={loading}
          appearance={{
            elements: {
              rootBox: compact ? 'w-12' : 'w-full min-w-0',
              userButtonBox: compact ? 'flex justify-center' : 'w-full min-w-0 flex flex-row-reverse justify-end',
              userButtonTrigger: compact ? 'size-12 justify-center rounded-full p-1' :
                'min-h-12 w-full justify-start gap-4 rounded-md p-0',
              avatarBox: 'size-10',
              userButtonOuterIdentifier:
                "min-w-0 truncate text-left text-sm font-semibold text-foreground after:mt-0.5 after:block after:truncate after:text-xs after:font-normal after:text-muted-foreground after:content-['Your_learning_space']",
            },
          }}
        />
      </Show>
    </div>
  );
}
