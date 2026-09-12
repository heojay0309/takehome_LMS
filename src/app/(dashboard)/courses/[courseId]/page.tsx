import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  formatDuration,
  getAllLessons,
  getCourseById,
} from "@/lib/courses";

type CourseDetailPageProps = PageProps<"/courses/[courseId]">;

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const firstLesson = getAllLessons(course)[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{course.category}</Badge>
            <Badge>{course.difficulty}</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{course.description}</p>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-zinc-500">Instructor</dt>
              <dd className="font-medium">{course.instructor}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Duration</dt>
              <dd className="font-medium">{formatDuration(course.durationMinutes)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Rating</dt>
              <dd className="font-medium">★ {course.rating}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Enrolled</dt>
              <dd className="font-medium">
                {course.enrolledCount.toLocaleString()} learners
              </dd>
            </div>
          </dl>
          {firstLesson && (
            <Link
              href={`/courses/${course.id}/lessons/${firstLesson.id}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Start course
            </Link>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>
        <div className="space-y-4">
          {course.modules.map((module) => (
            <div
              key={module.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="font-medium">{module.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${course.id}/lessons/${lesson.id}`}
                      className="hover:text-foreground hover:underline"
                    >
                      {lesson.title} · {lesson.durationMinutes} min
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
