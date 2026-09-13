import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { LessonNavigation } from '@/components/lessons/LessonNavigation';
import { LessonChecklist } from '@/components/lessons/LessonChecklist';
import { LessonVideoPlayer } from '@/components/lessons/LessonVideoPlayer';
import { getLessonById } from '@/lib/courses';
import { normalizeCatalogQuery, withCatalogContext } from '@/lib/catalog-state';

type LessonPageProps = PageProps<'/courses/[courseId]/lessons/[lessonId]'>;

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { courseId, lessonId } = await params;
  const catalogQuery = normalizeCatalogQuery((await searchParams).catalog);
  const result = getLessonById(courseId, lessonId);

  if (!result) {
    notFound();
  }

  const { course, module: courseModule, lesson } = result;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link href={withCatalogContext(`/courses/${course.id}`, catalogQuery)} className="hover:underline">
              {course.title}
            </Link>{' '}
            / {courseModule.title}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lesson.title}
          </h1>
        </div>
        <Link
          href={withCatalogContext(`/courses/${course.id}`, catalogQuery)}
          className={buttonVariants({ variant: 'outline' })}
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to course
        </Link>
      </div>

      <div className="space-y-4">
        <LessonVideoPlayer
          course={course}
          lesson={lesson}
          moduleTitle={courseModule.title}
          catalogQuery={catalogQuery}
        />
        <p className="text-xs text-muted-foreground">Sample footage for player demonstration; not the lesson recording. Finishing the preview marks this lesson complete. You can also change completion using the checklist.</p>
        <LessonNavigation course={course} lessonId={lesson.id} catalogQuery={catalogQuery} />
      </div>

      <details className="group/outline panel-padding rounded-xl border bg-card">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-lg font-semibold">Course content</span>
            <span className="text-sm text-muted-foreground">Browse all modules and lessons</span>
          </span>
          <ChevronDown className="size-5 shrink-0 transition-transform group-open/outline:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>
        <div className="mt-8">
          <LessonChecklist course={course} activeLessonId={lesson.id} catalogQuery={catalogQuery} />
        </div>
      </details>
    </div>
  );
}
