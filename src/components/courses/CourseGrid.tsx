import { CourseCard } from "@/components/courses/CourseCard";
import type { Course } from "@/lib/courses";

type CourseGridProps = {
  courses: Course[];
  progressByCourseId?: Record<string, number>;
};

export function CourseGrid({ courses, progressByCourseId }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
        No courses match your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          progressPercent={progressByCourseId?.[course.id]}
        />
      ))}
    </div>
  );
}
