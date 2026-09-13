import coursesData from "../../data/courses.json";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type Lesson = {
  id: string;
  title: string;
  durationMinutes: number;
};

export type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  thumbnail: string;
  instructor: string;
  rating: number;
  enrolledCount: number;
  modules: Module[];
};

export type CompletionStatus = "all" | "in-progress" | "completed";

export type CourseFilters = {
  search?: string;
  category?: string;
  difficulty?: Difficulty | "";
  completionStatus?: CompletionStatus;
};

export const CATEGORY_SEARCH_PARAM = "category";

const courses = coursesData as Course[];

export function getCourses(): Course[] {
  return courses;
}

export function getCourseById(courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId);
}

export function getCategories(): string[] {
  return [...new Set(courses.map((course) => course.category))].sort();
}

export function getCoursesByCategory(
  catalog: Course[] = courses,
): Array<{ category: string; courses: Course[] }> {
  const categories = [...new Set(catalog.map((course) => course.category))].sort();
  return categories.map((category) => ({
    category,
    courses: catalog.filter((course) => course.category === category),
  }));
}

export function getCatalogHref(category = ""): string {
  if (!category) return "/";
  return `/?${CATEGORY_SEARCH_PARAM}=${encodeURIComponent(category)}`;
}

export function resolveCategoryParam(
  value: string | string[] | null | undefined,
  catalog: Course[] = courses,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  return catalog.some((course) => course.category === raw) ? raw : "";
}

export function getDifficulties(): Difficulty[] {
  return ["Beginner", "Intermediate", "Advanced"];
}

export function filterCourses(
  filters: CourseFilters,
  progressByCourseId: Readonly<Record<string, number>> = {},
  catalog: Course[] = courses,
): Course[] {
  const search = filters.search?.trim().toLowerCase() ?? "";

  return catalog.filter((course) => {
    const matchesSearch =
      !search ||
      course.title.toLowerCase().includes(search) ||
      course.description.toLowerCase().includes(search) ||
      course.instructor.toLowerCase().includes(search);

    const matchesCategory =
      !filters.category || course.category === filters.category;

    const matchesDifficulty =
      !filters.difficulty || course.difficulty === filters.difficulty;

    const percent = progressByCourseId[course.id] ?? 0;
    const matchesCompletion =
      !filters.completionStatus || filters.completionStatus === "all" ||
      (filters.completionStatus === "in-progress" && percent > 0 && percent < 100) ||
      (filters.completionStatus === "completed" && percent === 100);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesCompletion;
  });
}

export function getAllLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function getLessonById(
  courseId: string,
  lessonId: string,
): { course: Course; module: Module; lesson: Lesson } | undefined {
  const course = getCourseById(courseId);
  if (!course) return undefined;

  for (const courseModule of course.modules) {
    const lesson = courseModule.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { course, module: courseModule, lesson };
    }
  }

  return undefined;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}
