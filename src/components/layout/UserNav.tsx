"use client";

import { Show, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function UserNav() {
  const { user } = useUser();

  return (
    <div className="flex min-h-11 shrink-0 items-center gap-3">
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <Button variant="outline" size="sm">Sign in</Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="hidden text-right sm:block">
          <p className="max-w-40 truncate text-sm font-semibold">
            {user?.firstName || user?.username || "Your account"}
          </p>
          <p className="text-xs text-muted-foreground">Your learning space</p>
        </div>
        <UserButton appearance={{ elements: { userButtonTrigger: "size-11", avatarBox: "size-10" } }} />
      </Show>
    </div>
  );
}
