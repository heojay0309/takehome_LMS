const INTENT_LIFETIME_MS = 30_000;

export function getAutoPlayFailureMessage(error: unknown): string | null {
  if (error instanceof Error && error.name === "AbortError") return null;
  return error instanceof Error && error.name === "NotAllowedError"
    ? "Automatic playback was blocked. Press Play to continue."
    : "Automatic playback could not start. Press Play to try again.";
}

/** Ephemeral, one-shot intent: never persisted in a URL or browser storage. */
export function createLessonPlaybackIntent(now: () => number = Date.now) {
  let pending: { courseId: string; lessonId: string; requestedAt: number } | null = null;

  return {
    request(courseId: string, lessonId: string) {
      pending = { courseId, lessonId, requestedAt: now() };
    },
    consume(courseId: string, lessonId: string): boolean {
      const intent = pending;
      pending = null;
      if (!intent) return false;
      const age = now() - intent.requestedAt;
      return age >= 0 && age <= INTENT_LIFETIME_MS &&
        intent.courseId === courseId && intent.lessonId === lessonId;
    },
  };
}
