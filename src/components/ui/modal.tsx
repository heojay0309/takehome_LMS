"use client";

import { useRef, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

/** Accessible modal shell: portal, focus trap/return, Escape dismissal and scroll lock. */
export function Modal({ open, onOpenChange, title, description, trigger, triggerClassName, disabled, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  trigger: ReactNode;
  triggerClassName?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger disabled={disabled} className={triggerClassName}>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup initialFocus={titleRef} className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] min-w-0 max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-card text-foreground shadow-xl">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b p-4 sm:px-8">
            <div className="min-w-0">
              <Dialog.Title ref={titleRef} tabIndex={-1} className="text-xl">{title}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-muted-foreground">{description}</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close dialog" className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-muted">
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="panel-padding min-h-0 overflow-y-auto overscroll-contain">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
