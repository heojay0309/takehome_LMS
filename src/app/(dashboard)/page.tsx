import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { getCourses } from "@/lib/courses";

export default function CourseCatalogPage() {
  const courses = getCourses();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Course catalog</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Browse curated courses, filter by topic or difficulty, and pick up where
          you left off.
        </p>
      </div>
      <CourseCatalog courses={courses} />
    </div>
  );
}
