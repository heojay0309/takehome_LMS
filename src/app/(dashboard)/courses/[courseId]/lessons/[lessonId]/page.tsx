import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonChecklist } from "@/components/lessons/LessonChecklist";
import { MockVideoPlayer } from "@/components/lessons/MockVideoPlayer";
import { getLessonById } from "@/lib/courses";

type LessonPageProps = PageProps<"/courses/[courseId]/lessons/[lessonId]">;

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params;
  const result = getLessonById(courseId, lessonId);

  if (!result) {
    notFound();
  }

  const { course, module, lesson } = result;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">
            <Link href={`/courses/${course.id}`} className="hover:underline">
              {course.title}
            </Link>{" "}
            / {module.title}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1>
        </div>
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Back to course
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <MockVideoPlayer
          title={lesson.title}
          durationMinutes={lesson.durationMinutes}
        />
        <aside className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold">Course content</h2>
          <LessonChecklist course={course} activeLessonId={lesson.id} />
        </aside>
      </div>
    </div>
  );
}
