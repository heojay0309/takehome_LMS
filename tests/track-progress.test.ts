import assert from "node:assert/strict";
import { test } from "node:test";
import { getAllLessons, getCourses } from "../src/lib/courses";
import { getTrackProgressSummary } from "../src/lib/track-progress";

const courses = getCourses().slice(0, 2);
const firstLessons = getAllLessons(courses[0]);

test("track progress counts partial lessons and reserves completion for every course", () => {
  assert.equal(getTrackProgressSummary(courses, {}).status, "Not started");
  assert.equal(getTrackProgressSummary(courses, { [courses[0].id]: { started: true, completedLessonIds: [] } }).status, "In progress");
  const partial = getTrackProgressSummary(courses, { [courses[0].id]: { completedLessonIds: [firstLessons[0].id, firstLessons[0].id, "unknown"] } });
  assert.equal(partial.completed, 1);
  assert.equal(partial.completedCourses, 0);
  assert.ok(partial.percent > 0 && partial.percent < 100);
  assert.equal(partial.isCompleted, false);
  const oneComplete = getTrackProgressSummary(courses, { [courses[0].id]: { completedLessonIds: firstLessons.map(l => l.id) } });
  assert.equal(oneComplete.completedCourses, 1);
  assert.equal(oneComplete.isCompleted, false);
  assert.equal(oneComplete.percent, Math.round(firstLessons.length / courses.flatMap(getAllLessons).length * 100));
  const all = Object.fromEntries(courses.map(c => [c.id, { completedLessonIds: getAllLessons(c).map(l => l.id) }]));
  const summary = getTrackProgressSummary(courses, all);
  assert.equal(summary.status, "Completed");
  assert.equal(summary.isCompleted, true);
  assert.equal(summary.percent, 100);
  all[courses[0].id].completedLessonIds.pop();
  assert.equal(getTrackProgressSummary(courses, all).isCompleted, false);
});

test("empty tracks and empty courses are not completed", () => {
  assert.equal(getTrackProgressSummary([], {}).isCompleted, false);
  assert.equal(getTrackProgressSummary([], {}).percent, 0);
  const emptyCourse = { ...courses[0], modules: [] };
  assert.equal(getTrackProgressSummary([emptyCourse], {}).isCompleted, false);
  const progress = { [courses[1].id]: { completedLessonIds: getAllLessons(courses[1]).map(l => l.id) } };
  assert.equal(getTrackProgressSummary([emptyCourse, courses[1]], progress).percent, 99);
});
