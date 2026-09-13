import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CourseProgressBar } from "../src/components/courses/CourseProgressBar";
import { EmptyState } from "../src/components/ui/empty-state";
import { LoadingState } from "../src/components/ui/loading-state";
import { filterCourses, getAllLessons, getCourses } from "../src/lib/courses";
import { DEFAULT_CATALOG_STATE, readCatalogState, updateCatalogQuery } from "../src/lib/catalog-state";
import { EMPTY_PROGRESS, getCourseProgressSummary } from "../src/lib/progress";
import { createProgressStore } from "../src/lib/progress-store";

const courses = getCourses();

test("every unstarted catalog course renders a visible and accessible 0%", () => {
  for (const course of courses) {
    const { percent } = getCourseProgressSummary(course, EMPTY_PROGRESS);
    const html = renderToStaticMarkup(createElement(CourseProgressBar, { percent }));
    assert.match(html, />0%<\/span>/, course.title);
    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-valuenow="0"/);
    assert.match(html, /aria-valuemin="0" aria-valuemax="100"/);
    assert.match(html, /style="width:0%"/);
  }
});

test("visiting a course with no completed lessons keeps catalog progress at zero", () => {
  const store = createProgressStore("ui-test", courses, () => ({ getItem: () => null, setItem: () => {} }));
  const course = courses[0];
  store.visitLesson(course.id, getAllLessons(course)[0].id);
  const snapshot = store.getSnapshot();
  const progress = Object.fromEntries(courses.map((item) => [item.id, getCourseProgressSummary(item, snapshot.courses[item.id]).percent]));
  assert.equal(progress[course.id], 0);
  assert.equal(filterCourses(DEFAULT_CATALOG_STATE, progress).length, courses.length);
  assert.deepEqual(filterCourses({ completionStatus: "in-progress" }, progress), []);
  assert.deepEqual(filterCourses({ completionStatus: "completed" }, progress), []);
});

test("no-match combined filters recover to all courses without discarding the selected track", () => {
  const query = updateCatalogQuery("track=web", {
    search: "no-such-course-xyz", category: courses[0].category,
    difficulty: courses[0].difficulty, completionStatus: "completed",
  });
  assert.deepEqual(filterCourses(readCatalogState(new URLSearchParams(query))), []);
  const reset = updateCatalogQuery(query, DEFAULT_CATALOG_STATE);
  assert.equal(reset, "track=web");
  assert.equal(filterCourses(readCatalogState(new URLSearchParams(reset))).length, courses.length);
});

test("empty state supplies readable guidance and a recovery action", () => {
  const html = renderToStaticMarkup(createElement(EmptyState, {
    title: "No courses match your search or filters",
    description: "Try another keyword or clear your filters.",
    icon: createElement("svg"),
    action: createElement("button", { type: "button" }, "Show all courses"),
  }));
  assert.match(html, /<h3[^>]*>No courses match your search or filters<\/h3>/);
  assert.match(html, /Try another keyword/);
  assert.match(html, /<button type="button">Show all courses<\/button>/);
  assert.match(html, /aria-hidden="true"/);
});

test("loading state announces text without exposing decorative skeletons", () => {
  const html = renderToStaticMarkup(
    <LoadingState label="Loading courses"><div aria-hidden="true" /></LoadingState>,
  );
  assert.match(html, /^<div role="status">/);
  assert.match(html, /<span class="sr-only">Loading courses…<\/span>/);
  assert.match(html, /<div aria-hidden="true"><\/div>/);
});
