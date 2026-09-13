import assert from "node:assert/strict";
import { test } from "node:test";
import { getAllLessons, getCourses } from "../src/lib/courses";
import { createProgressStore } from "../src/lib/progress-store";
import { getLessonCompletionState } from "../src/lib/lesson-completion";
import { EMPTY_PROGRESS } from "../src/lib/progress";

const courses = getCourses();
const course = courses[0];
const lessons = getAllLessons(course);
function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

test("video completion is idempotent across replays and preserves visit metadata", () => {
  const storage = memoryStorage();
  const store = createProgressStore("alice", courses, () => storage);
  store.visitLesson(course.id, lessons[0].id, 100);
  let updates = 0;
  store.subscribe(() => updates++);
  store.completeLesson(course.id, lessons[0].id);
  const completed = store.getSnapshot();
  store.completeLesson(course.id, lessons[0].id);
  assert.equal(store.getSnapshot(), completed);
  assert.equal(updates, 1);
  assert.deepEqual(completed.courses[course.id].completedLessonIds, [lessons[0].id]);
  assert.deepEqual(completed.courses[course.id].lastVisited, { lessonId: lessons[0].id, at: 100 });
  assert.deepEqual(createProgressStore("alice", courses, () => storage).getSnapshot().courses[course.id], completed.courses[course.id]);
  assert.deepEqual(createProgressStore("bob", courses, () => storage).getSnapshot().courses[course.id], EMPTY_PROGRESS);
});

test("completing in a stale tab retains other work and refreshes already-completed state", () => {
  const storage = memoryStorage();
  const first = createProgressStore("alice", courses, () => storage);
  const second = createProgressStore("alice", courses, () => storage);
  second.getSnapshot();
  first.completeLesson(course.id, lessons[0].id);
  second.completeLesson(course.id, lessons[0].id);
  assert.deepEqual(second.getSnapshot().courses[course.id], first.getSnapshot().courses[course.id]);
  first.completeLesson(course.id, lessons[1].id);
  second.completeLesson(course.id, lessons[2].id);
  assert.deepEqual(second.getSnapshot().courses[course.id].completedLessonIds, lessons.slice(0, 3).map((lesson) => lesson.id));
});

test("video completion tolerates blocked storage, ignores invalid IDs, and allows manual undo", () => {
  const store = createProgressStore("alice", courses, () => { throw new Error("blocked"); });
  const initial = store.getSnapshot();
  store.completeLesson("missing", lessons[0].id);
  store.completeLesson(course.id, "missing");
  assert.equal(store.getSnapshot(), initial);
  store.completeLesson(course.id, lessons[0].id);
  store.completeLesson(course.id, lessons[0].id);
  assert.deepEqual(store.getSnapshot().courses[course.id].completedLessonIds, [lessons[0].id]);
  assert.equal(store.getSnapshot().storageAvailable, false);
  store.toggleLesson(course.id, lessons[0].id);
  assert.deepEqual(store.getSnapshot().courses[course.id].completedLessonIds, []);
});

test("end-screen next lesson crosses module boundaries in catalog order", () => {
  const boundary = course.modules[0].lessons.at(-1)!;
  const state = getLessonCompletionState(course, boundary.id, { completedLessonIds: [boundary.id] });
  assert.equal(state.lessonComplete, true);
  assert.equal(state.isCompleted, false);
  assert.equal(state.nextLesson?.id, course.modules[1].lessons[0].id);
  assert.equal(state.isSequentialNext, true);
});

test("the final sequential lesson does not celebrate an unfinished course", () => {
  const last = lessons[lessons.length - 1];
  const state = getLessonCompletionState(course, last.id, { completedLessonIds: [last.id] });
  assert.equal(state.isCompleted, false);
  assert.equal(state.nextLesson?.id, lessons[0].id);
  assert.equal(state.isSequentialNext, false);
});

test("the final outstanding lesson celebrates the course even when completed out of order", () => {
  const state = getLessonCompletionState(course, lessons[1].id, { completedLessonIds: lessons.map((lesson) => lesson.id) });
  assert.equal(state.isCompleted, true);
  assert.equal(state.percent, 100);
  assert.equal(state.nextLesson, undefined);
  assert.equal(state.isSequentialNext, false);
  const empty = getLessonCompletionState({ ...course, modules: [] }, "missing", EMPTY_PROGRESS);
  assert.equal(empty.isCompleted, false);
  assert.equal(empty.nextLesson, undefined);
});
