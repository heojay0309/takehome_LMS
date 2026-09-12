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

export type CourseFilters = {
  search?: string;
  category?: string;
  difficulty?: Difficulty | "";
};

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

export function getDifficulties(): Difficulty[] {
  return ["Beginner", "Intermediate", "Advanced"];
}

export function filterCourses(filters: CourseFilters): Course[] {
  const search = filters.search?.trim().toLowerCase() ?? "";

  return courses.filter((course) => {
    const matchesSearch =
      !search ||
      course.title.toLowerCase().includes(search) ||
      course.description.toLowerCase().includes(search) ||
      course.instructor.toLowerCase().includes(search);

    const matchesCategory =
      !filters.category || course.category === filters.category;

    const matchesDifficulty =
      !filters.difficulty || course.difficulty === filters.difficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
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

  for (const module of course.modules) {
    const lesson = module.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { course, module, lesson };
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
