import { Suspense } from 'react';
import { BookOpen, Layers } from 'lucide-react';
import { CourseCatalog } from '@/components/courses/CourseCatalog';
import { ContinueLearning } from '@/components/courses/ContinueLearning';
import { LearningPathSkeleton } from '@/components/onboarding/LearningPathSkeleton';
import { CourseCatalogSkeleton } from '@/components/courses/CourseSkeletons';
import { LearningPath } from '@/components/onboarding/LearningPath';
import { getCategories, getCourses } from '@/lib/courses';

export default function CourseCatalogPage() {
  const courses = getCourses();

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl">Your learning space</h1>
        <ContinueLearning />
      </div>
      <div id="learning-path" className="scroll-mt-8 empty:hidden">
        <Suspense fallback={<LearningPathSkeleton />}>
          <LearningPath />
        </Suspense>
      </div>
      <section
        id="catalog"
        aria-labelledby="catalog-heading"
        className="scroll-mt-8 space-y-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary-hover uppercase">
              Find your next step
            </p>
            <h2 id="catalog-heading" className="text-2xl sm:text-3xl">
              Explore the catalog
            </h2>
            <p className="mt-2 text-muted-foreground">
              A new perspective is just a lesson away.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <BookOpen className="size-4" aria-hidden="true" />
              {courses.length} courses
            </span>
            <span className="inline-flex items-center gap-2">
              <Layers className="size-4" aria-hidden="true" />
              {getCategories().length} categories
            </span>
          </div>
        </div>
        <Suspense fallback={<CourseCatalogSkeleton />}>
          <CourseCatalog courses={courses} />
        </Suspense>
      </section>
    </div>
  );
}
