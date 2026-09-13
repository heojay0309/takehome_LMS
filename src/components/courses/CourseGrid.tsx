import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";
import type { Course } from "@/lib/courses";

type CourseGridProps = {
  courses: Course[];
  progressByCourseId?: Record<string, number>;
  catalogQuery?: string;
  onClearFilters?: () => void;
};

export function CourseGrid({ courses, progressByCourseId, catalogQuery, onClearFilters }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses match your search or filters"
        description="Try a different keyword or clear your filters to find your next step. All courses are still here to explore."
        icon={<SearchX className="size-8" />}
        action={onClearFilters && <Button variant="outline" onClick={onClearFilters}>Show all courses</Button>}
      />
    );
  }

  return (
    <div className="catalog-grid">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          catalogQuery={catalogQuery}
          progressPercent={progressByCourseId?.[course.id]}
        />
      ))}
    </div>
  );
}
