import assert from "node:assert/strict";
import { test } from "node:test";
import { getAllLessons, getCourses } from "../src/lib/courses";
import { EMPTY_PROGRESS, getCourseContinuation, getCourseProgressSummary, getInProgressCourses, getLessonProgressSummary, getProgressStorageKey, getRemainingLessonMinutes, parseCourseProgress } from "../src/lib/progress";
import { createProgressStore } from "../src/lib/progress-store";

const courses = getCourses();
const course = courses[0];
const lessons = getAllLessons(course);
function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

test("visits persist per user without completing lessons; toggles retain the resume target", () => {
  const storage = memoryStorage();
  const store = createProgressStore("alice", courses, () => storage);
  store.visitLesson(course.id, lessons[3].id, 100);
  let progress = store.getSnapshot().courses[course.id];
  assert.equal(progress.started, true);
  assert.equal(getCourseProgressSummary(course, progress).percent, 0);
  assert.equal(getCourseContinuation(course, progress).lesson?.id, lessons[3].id);
  store.toggleLesson(course.id, lessons[0].id);
  progress = store.getSnapshot().courses[course.id];
  assert.deepEqual(progress.lastVisited, { lessonId: lessons[3].id, at: 100 });
  assert.deepEqual(createProgressStore("alice", courses, () => storage).getSnapshot().courses[course.id], progress);
  assert.deepEqual(createProgressStore("bob", courses, () => storage).getSnapshot().courses[course.id], EMPTY_PROGRESS);
  store.toggleLesson(course.id, lessons[3].id);
  assert.equal(getCourseContinuation(course, store.getSnapshot().courses[course.id]).lesson?.id, lessons[1].id);
});

test("continue learning is ordered by visits, includes started 0%, and excludes finished courses", () => {
  const storage = memoryStorage();
  const store = createProgressStore("alice", courses, () => storage);
  assert.deepEqual(getInProgressCourses(courses, store.getSnapshot().courses), []);
  store.startCourse(course.id);
  store.visitLesson(courses[1].id, getAllLessons(courses[1])[0].id, 100);
  store.visitLesson(course.id, lessons[2].id, 200);
  assert.deepEqual(getInProgressCourses(courses, store.getSnapshot().courses).map((entry) => entry.course.id), [course.id, courses[1].id]);
  for (const lesson of lessons) store.toggleLesson(course.id, lesson.id);
  assert.deepEqual(getInProgressCourses(courses, store.getSnapshot().courses).map((entry) => entry.course.id), [courses[1].id]);
  store.toggleLesson(course.id, lessons[0].id);
  assert.equal(getInProgressCourses(courses, store.getSnapshot().courses)[0].course.id, course.id);
});

test("visit validation, cross-tab synchronization and blocked storage remain safe", () => {
  for (const lastVisited of [null, false, { lessonId: 5, at: 10 }, { lessonId: "a", at: -1 }, { lessonId: "a", at: "10" }, { lessonId: "a", at: 1.5 }]) {
    assert.deepEqual(parseCourseProgress(JSON.stringify({ completedLessonIds: [], lastVisited })), EMPTY_PROGRESS);
  }
  const storage = memoryStorage();
  const store = createProgressStore("alice", courses, () => storage);
  const other = createProgressStore("alice", courses, () => storage);
  other.getSnapshot();
  const initial = store.getSnapshot();
  store.visitLesson("unknown", lessons[0].id, 1);
  store.visitLesson(course.id, "unknown", 1);
  store.visitLesson(course.id, lessons[0].id, NaN);
  assert.equal(store.getSnapshot(), initial);
  store.visitLesson(course.id, lessons[0].id, 100);
  other.refresh(getProgressStorageKey("alice", course.id));
  assert.deepEqual(other.getSnapshot().courses[course.id], store.getSnapshot().courses[course.id]);
  const once = store.getSnapshot();
  store.visitLesson(course.id, lessons[0].id, 100);
  assert.equal(store.getSnapshot(), once);
  const blocked = createProgressStore("alice", courses, () => { throw new Error("blocked"); });
  blocked.visitLesson(course.id, lessons[2].id, 100);
  blocked.toggleLesson(course.id, lessons[0].id);
  assert.equal(blocked.getSnapshot().storageAvailable, false);
  assert.equal(getCourseContinuation(course, blocked.getSnapshot().courses[course.id]).lesson?.id, lessons[2].id);
});

test("stale visit IDs fall back to first unfinished lesson and do not affect ordering", () => {
  const stale = { completedLessonIds: [lessons[0].id], started: true as const, lastVisited: { lessonId: "removed", at: 1000 } };
  const valid = { completedLessonIds: [], started: true as const, lastVisited: { lessonId: getAllLessons(courses[1])[0].id, at: 10 } };
  assert.equal(getCourseContinuation(course, stale).lesson?.id, lessons[1].id);
  assert.equal(getInProgressCourses(courses, { [course.id]: stale, [courses[1].id]: valid })[0].course.id, courses[1].id);
});

test("module progress and remaining-time estimates count valid unfinished lessons only", () => {
  const progress = { completedLessonIds: [lessons[0].id, lessons[0].id, "removed"] };
  assert.equal(getLessonProgressSummary(course.modules[0].lessons, progress).completed, 1);
  assert.equal(getLessonProgressSummary([], progress).percent, 0);
  assert.equal(getRemainingLessonMinutes(course, progress), lessons.slice(1).reduce((sum, lesson) => sum + lesson.durationMinutes, 0));
  assert.equal(getRemainingLessonMinutes(course, { completedLessonIds: lessons.map((lesson) => lesson.id) }), 0);
});
