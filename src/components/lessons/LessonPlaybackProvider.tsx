"use client";

import { createContext, useContext, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createLessonPlaybackIntent } from "@/lib/lesson-playback";

const PlaybackContext = createContext<ReturnType<typeof createLessonPlaybackIntent> | null>(null);

export function LessonPlaybackProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  // An account change discards both pending intent and the old user's player.
  return <PlaybackSession key={user?.id ?? "signed-out"}>{children}</PlaybackSession>;
}

function PlaybackSession({ children }: { children: React.ReactNode }) {
  const [intent] = useState(() => createLessonPlaybackIntent());
  return <PlaybackContext.Provider value={intent}>{children}</PlaybackContext.Provider>;
}

export function useLessonPlayback() {
  const intent = useContext(PlaybackContext);
  if (!intent) throw new Error("Lesson playback requires LessonPlaybackProvider");
  return intent;
}
