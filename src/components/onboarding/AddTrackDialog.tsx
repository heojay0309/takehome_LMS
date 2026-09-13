"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { buttonVariants } from "@/components/ui/button";
import { useOnboardingPreference } from "@/hooks/useOnboardingPreference";
import { TrackQuiz } from "@/components/onboarding/TrackQuiz";
import { GOALS, type Answers } from "@/lib/onboarding";

export function AddTrackDialog({ initialAnswers, className }: { initialAnswers?: Answers; className?: string }) {
  const state = useOnboardingPreference();
  // Key the modal session by user so an account switch discards any draft.
  return <TrackDialogSession key={state.userId} initialAnswers={initialAnswers} className={className} />;
}

function TrackDialogSession({ initialAnswers, className }: { initialAnswers?: Answers; className?: string }) {
  const { ready, save, storageAvailable } = useOnboardingPreference();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  return <>
    <Modal open={open} onOpenChange={next => { setOpen(next); if (next) setMessage(""); }}
      title={initialAnswers ? "Edit your track" : "Add a learning track"}
      description="Choose your goal and experience to build a suggested course sequence."
      disabled={!ready}
      triggerClassName={className ?? buttonVariants({ variant: "outline" })}
      trigger={initialAnswers ? "Edit my answers" : <><Plus className="size-4" aria-hidden="true" />Add track</>}>
      {open && <TrackQuiz initialAnswers={initialAnswers} onCancel={() => setOpen(false)} onSave={answers => {
        save({ version: 2, answers });
        setMessage(`${GOALS[answers.goal]} saved to your classroom.`);
        setOpen(false);
      }} />}
    </Modal>
    <p role="status" className={message ? "mt-2 text-sm text-muted-foreground" : "sr-only"}>
      {message}{message && !storageAvailable ? " Saved only in this tab because browser storage is unavailable." : ""}
    </p>
  </>;
}
