import assert from "node:assert/strict";
import { test } from "node:test";
import { getAllLessons, getCourses, type Course } from "../src/lib/courses";
import { EMPTY_PROGRESS, getCourseContinuation, getCourseProgressSummary, getProgressStorageKey, parseCourseProgress } from "../src/lib/progress";
import { createProgressStore } from "../src/lib/progress-store";

const courses = getCourses();
const course = courses[0];
const lessons = getAllLessons(course);

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
  };
}

test("progress parsing tolerates corrupt data and removes duplicates/non-string IDs", () => {
  for (const raw of [null, "broken", "null", "[]", "5", '{"completedLessonIds":false}']) {
    assert.deepEqual(parseCourseProgress(raw), EMPTY_PROGRESS);
  }
  assert.deepEqual(parseCourseProgress('{"completedLessonIds":["a","a",7,null,"b"]}'), {
    completedLessonIds: ["a", "b"],
  });
});

test("summary counts only catalog lessons, including zero, partial, and complete", () => {
  assert.equal(getCourseProgressSummary(course, EMPTY_PROGRESS).percent, 0);
  assert.deepEqual(getCourseProgressSummary(course, { completedLessonIds: [lessons[0].id, lessons[0].id, "unknown"] }), {
    completed: 1, total: lessons.length, percent: Math.round(100 / lessons.length), isCompleted: false,
  });
  assert.equal(getCourseProgressSummary(course, { completedLessonIds: lessons.map((lesson) => lesson.id) }).percent, 100);
  assert.deepEqual(getCourseProgressSummary({ ...course, modules: [] }, EMPTY_PROGRESS), {
    completed: 0, total: 0, percent: 0, isCompleted: false,
  });
});

test("partial progress cannot round to an unstarted or complete course", () => {
  const longCourse: Course = {
    ...course,
    modules: [{ id: "many", title: "Many lessons", lessons: Array.from({ length: 300 }, (_, index) => ({
      id: String(index), title: String(index), durationMinutes: 1,
    })) }],
  };
  assert.equal(getCourseProgressSummary(longCourse, { completedLessonIds: ["0"] }).percent, 1);
  assert.equal(getCourseProgressSummary(longCourse, { completedLessonIds: getAllLessons(longCourse).slice(1).map((lesson) => lesson.id) }).percent, 99);
});

test("server snapshot does not access storage; client snapshots are cached", () => {
  let reads = 0;
  const store = createProgressStore("alice", courses, () => {
    reads++;
    return memoryStorage();
  });
  assert.equal(store.getServerSnapshot(), null);
  assert.equal(reads, 0);
  const snapshot = store.getSnapshot();
  assert.equal(store.getSnapshot(), snapshot);
  assert.equal(reads, courses.length);
});

test("toggles synchronously notify all views, persist on reload, and isolate users/courses", () => {
  const storage = memoryStorage();
  const alice = createProgressStore("alice", courses, () => storage);
  const bob = createProgressStore("bob", courses, () => storage);
  let checklistUpdates = 0;
  let catalogUpdates = 0;
  const unsubscribe = alice.subscribe(() => checklistUpdates++);
  alice.subscribe(() => catalogUpdates++);
  const previous = alice.getSnapshot();
  alice.toggleLesson(course.id, lessons[0].id);
  const next = alice.getSnapshot();
  assert.notEqual(next, previous);
  assert.deepEqual(previous.courses[course.id], EMPTY_PROGRESS);
  assert.deepEqual(next.courses[course.id].completedLessonIds, [lessons[0].id]);
  assert.equal(checklistUpdates, 1);
  assert.equal(catalogUpdates, 1);
  assert.ok(storage.data.has(`betteru-progress:alice:${course.id}`));
  assert.deepEqual(bob.getSnapshot().courses[course.id], EMPTY_PROGRESS);
  assert.deepEqual(next.courses[courses[1].id], EMPTY_PROGRESS);
  const reloaded = createProgressStore("alice", courses, () => storage);
  assert.deepEqual(reloaded.getSnapshot().courses[course.id], next.courses[course.id]);
  unsubscribe();
  alice.toggleLesson(course.id, lessons[0].id);
  assert.deepEqual(alice.getSnapshot().courses[course.id], { completedLessonIds: [], started: true });
  assert.equal(checklistUpdates, 1);
  assert.equal(catalogUpdates, 2);
});

test("full completion and unchecking immediately update percentage", () => {
  const storage = memoryStorage();
  const store = createProgressStore("alice", courses, () => storage);
  for (const lesson of lessons) store.toggleLesson(course.id, lesson.id);
  assert.equal(getCourseProgressSummary(course, store.getSnapshot().courses[course.id]).percent, 100);
  store.toggleLesson(course.id, lessons[0].id);
  assert.equal(getCourseProgressSummary(course, store.getSnapshot().courses[course.id]).isCompleted, false);
});

test("cross-tab refresh handles writes, deletion, clear, and unrelated user events", () => {
  const storage = memoryStorage();
  const first = createProgressStore("alice", courses, () => storage);
  const second = createProgressStore("alice", courses, () => storage);
  const initial = second.getSnapshot();
  const key = getProgressStorageKey("alice", course.id);
  first.toggleLesson(course.id, lessons[0].id);
  second.refresh(getProgressStorageKey("bob", course.id));
  assert.equal(second.getSnapshot(), initial);
  second.refresh(key);
  assert.deepEqual(second.getSnapshot().courses[course.id].completedLessonIds, [lessons[0].id]);
  // Re-read storage before a write, even if a storage event has not arrived.
  second.toggleLesson(course.id, lessons[1].id);
  first.toggleLesson(course.id, lessons[2].id);
  assert.equal(first.getSnapshot().courses[course.id].completedLessonIds.length, 3);
  storage.data.delete(key);
  second.refresh(key);
  assert.deepEqual(second.getSnapshot().courses[course.id], EMPTY_PROGRESS);
  first.refresh(null);
  assert.deepEqual(first.getSnapshot().courses[course.id], EMPTY_PROGRESS);
});

test("unavailable storage and failed writes preserve interactive in-memory progress", () => {
  const blocked = createProgressStore("alice", courses, () => { throw new Error("SecurityError"); });
  assert.equal(blocked.getSnapshot().storageAvailable, false);
  blocked.toggleLesson(course.id, lessons[0].id);
  assert.deepEqual(blocked.getSnapshot().courses[course.id].completedLessonIds, [lessons[0].id]);

  const full = createProgressStore("alice", courses, () => ({
    getItem: () => null,
    setItem: () => { throw new Error("QuotaExceededError"); },
  }));
  assert.equal(full.getSnapshot().storageAvailable, true);
  full.toggleLesson(course.id, lessons[0].id);
  full.toggleLesson(course.id, lessons[1].id);
  assert.equal(full.getSnapshot().storageAvailable, false);
  assert.deepEqual(full.getSnapshot().courses[course.id].completedLessonIds, [lessons[0].id, lessons[1].id]);
});

test("starting a course persists at 0%, notifies subscribers, and is idempotent", () => {
  const storage = memoryStorage();
  const store = createProgressStore("alice", courses, () => storage);
  let updates = 0;
  store.subscribe(() => updates++);
  store.startCourse(course.id);
  const progress = store.getSnapshot().courses[course.id];
  assert.deepEqual(progress, { completedLessonIds: [], started: true });
  assert.equal(getCourseProgressSummary(course, progress).percent, 0);
  assert.equal(getCourseContinuation(course, progress).isInProgress, true);
  store.startCourse(course.id);
  assert.equal(updates, 1);
  assert.equal(store.getSnapshot().courses[course.id], progress);
  const reloaded = createProgressStore("alice", courses, () => storage);
  assert.deepEqual(reloaded.getSnapshot().courses[course.id], progress);
  const otherUser = createProgressStore("bob", courses, () => storage);
  assert.equal(getCourseContinuation(course, otherUser.getSnapshot().courses[course.id]).isInProgress, false);
});

test("continuation supports legacy progress, resumes unfinished lessons, and excludes completed courses", () => {
  assert.equal(getCourseContinuation(course, EMPTY_PROGRESS).isInProgress, false);
  const legacy = { completedLessonIds: [lessons[0].id] };
  const continuation = getCourseContinuation(course, legacy);
  assert.equal(continuation.isStarted, true);
  assert.equal(continuation.isInProgress, true);
  assert.equal(continuation.lesson?.id, lessons[1].id);
  assert.equal(getCourseContinuation(course, { completedLessonIds: ["unknown"] }).isInProgress, false);
  const completed = { completedLessonIds: lessons.map((lesson) => lesson.id) };
  assert.equal(getCourseContinuation(course, completed).isInProgress, false);
  assert.equal(getCourseContinuation(course, completed).lesson?.id, lessons[0].id);
  assert.equal(getCourseContinuation({ ...course, modules: [] }, { ...EMPTY_PROGRESS, started: true }).isInProgress, false);
});

test("started metadata is validated, preserved through toggles, and synced across tabs", () => {
  assert.deepEqual(parseCourseProgress('{"started":true,"completedLessonIds":[]}'), { completedLessonIds: [], started: true });
  assert.deepEqual(parseCourseProgress('{"started":"true","completedLessonIds":[]}'), EMPTY_PROGRESS);
  const storage = memoryStorage();
  const store = createProgressStore("alice", courses, () => storage);
  const otherTab = createProgressStore("alice", courses, () => storage);
  otherTab.getSnapshot();
  store.startCourse(course.id);
  otherTab.refresh(getProgressStorageKey("alice", course.id));
  assert.equal(otherTab.getSnapshot().courses[course.id].started, true);
  for (const lesson of lessons) store.toggleLesson(course.id, lesson.id);
  assert.equal(getCourseContinuation(course, store.getSnapshot().courses[course.id]).isInProgress, false);
  store.toggleLesson(course.id, lessons[0].id);
  assert.equal(getCourseContinuation(course, store.getSnapshot().courses[course.id]).isInProgress, true);
  assert.equal(store.getSnapshot().courses[course.id].started, true);
});

test("starting with blocked storage remains usable and cannot start invalid or empty courses", () => {
  const store = createProgressStore("alice", [...courses, { ...course, id: "empty", modules: [] }], () => { throw new Error("blocked"); });
  const initial = store.getSnapshot();
  store.startCourse("missing");
  store.startCourse("empty");
  assert.equal(store.getSnapshot(), initial);
  store.startCourse(course.id);
  assert.equal(getCourseContinuation(course, store.getSnapshot().courses[course.id]).isInProgress, true);
  assert.equal(store.getSnapshot().storageAvailable, false);
});

test("invalid course/lesson toggles are ignored", () => {
  const store = createProgressStore("alice", courses, memoryStorage);
  const snapshot = store.getSnapshot();
  store.toggleLesson("missing", lessons[0].id);
  store.toggleLesson(course.id, "missing");
  assert.equal(store.getSnapshot(), snapshot);
});
