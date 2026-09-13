import assert from "node:assert/strict";
import { test } from "node:test";
import { createLessonPlaybackIntent, getAutoPlayFailureMessage } from "../src/lib/lesson-playback";

test("next-lesson playback is opt-in and consumed exactly once", () => {
  const intent = createLessonPlaybackIntent();
  assert.equal(intent.consume("course", "lesson"), false);
  intent.request("course", "lesson");
  assert.equal(intent.consume("course", "lesson"), true);
  assert.equal(intent.consume("course", "lesson"), false);
});

test("an unrelated lesson does not autoplay and discards the old navigation intent", () => {
  const intent = createLessonPlaybackIntent();
  intent.request("course-a", "lesson");
  assert.equal(intent.consume("course-b", "lesson"), false);
  assert.equal(intent.consume("course-a", "lesson"), false);
  intent.request("course-a", "next");
  assert.equal(intent.consume("course-a", "previous"), false);
});

test("abandoned navigation intent expires", () => {
  let time = 1000;
  const intent = createLessonPlaybackIntent(() => time);
  intent.request("course", "lesson");
  time += 30_001;
  assert.equal(intent.consume("course", "lesson"), false);
  intent.request("course", "lesson");
  time -= 1;
  assert.equal(intent.consume("course", "lesson"), false);
});

test("a newer navigation replaces an earlier unconsumed request", () => {
  const intent = createLessonPlaybackIntent();
  intent.request("course", "first");
  intent.request("course", "second");
  assert.equal(intent.consume("course", "second"), true);
  assert.equal(intent.consume("course", "first"), false);
});

test("playback intent is not shared with fresh account, tab, or reload sessions", () => {
  const first = createLessonPlaybackIntent();
  const fresh = createLessonPlaybackIntent();
  first.request("course", "lesson");
  assert.equal(fresh.consume("course", "lesson"), false);
  assert.equal(first.consume("course", "lesson"), true);
});

test("browser autoplay rejection gives a manual-play fallback without mislabeling cancellation", () => {
  const failure = (name: string) => Object.assign(new Error(), { name });
  assert.equal(getAutoPlayFailureMessage(failure("NotAllowedError")), "Automatic playback was blocked. Press Play to continue.");
  assert.equal(getAutoPlayFailureMessage(failure("AbortError")), null);
  assert.equal(getAutoPlayFailureMessage(failure("NotSupportedError")), "Automatic playback could not start. Press Play to try again.");
  assert.match(getAutoPlayFailureMessage(undefined) ?? "", /Press Play/);
});
