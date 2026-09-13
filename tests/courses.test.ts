import assert from "node:assert/strict";
import { test } from "node:test";
import { filterCourses, getCatalogHref, getCourses, getCoursesByCategory, resolveCategoryParam, type Course } from "../src/lib/courses";

const courses = getCourses();
const progress = { [courses[0].id]: 0, [courses[1].id]: 50, [courses[2].id]: 100 };

test("completion filters distinguish unstarted, in-progress, and completed courses", () => {
  assert.equal(filterCourses({ completionStatus: "all" }, progress).length, courses.length);
  assert.deepEqual(filterCourses({ completionStatus: "in-progress" }, progress).map((course) => course.id), [courses[1].id]);
  assert.deepEqual(filterCourses({ completionStatus: "completed" }, progress).map((course) => course.id), [courses[2].id]);
  assert.deepEqual(filterCourses({ completionStatus: "completed" }), []);
});

test("search, category, difficulty, and completion filters combine", () => {
  const completed = courses[2];
  assert.deepEqual(filterCourses({
    search: `  ${completed.title.toUpperCase()}  `,
    category: completed.category,
    difficulty: completed.difficulty,
    completionStatus: "completed",
  }, progress), [completed]);
  assert.deepEqual(filterCourses({
    search: completed.title,
    category: "No such category",
    completionStatus: "completed",
  }, progress), []);
});

test("catalog hrefs and category params stay in sync with known categories", () => {
  assert.equal(getCatalogHref(), "/");
  assert.equal(getCatalogHref("Design"), "/?category=Design");
  assert.equal(getCatalogHref("Web Development"), "/?category=Web%20Development");
  assert.equal(resolveCategoryParam("Design"), "Design");
  assert.equal(resolveCategoryParam(["Web Development"]), "Web Development");
  assert.equal(resolveCategoryParam("No such category"), "");
  assert.deepEqual(getCoursesByCategory().map((group) => group.category), [
    "Business",
    "Data Science",
    "Design",
    "DevOps",
    "Mobile",
    "Web Development",
  ]);
});

test("search matches description independently of the title and filters supplied catalog", () => {
  const fixture: Course = { ...courses[0], title: "A course", description: "Explore lunar geology", instructor: "Teacher" };
  assert.deepEqual(filterCourses({ search: "LUNAR" }, {}, [fixture]), [fixture]);
  assert.deepEqual(filterCourses({ search: "not present" }, {}, [fixture]), []);
});
