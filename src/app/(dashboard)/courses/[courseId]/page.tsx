import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CourseStartLink } from "@/components/courses/CourseStartLink";
import { LessonChecklist } from "@/components/lessons/LessonChecklist";
import { Badge } from "@/components/ui/badge";
import { getCatalogReturnHref, normalizeCatalogQuery } from "@/lib/catalog-state";
import { buttonVariants } from "@/components/ui/button";
import {
  formatDuration,
  getCourseById,
} from "@/lib/courses";

type CourseDetailPageProps = PageProps<"/courses/[courseId]">;

export default async function CourseDetailPage({ params, searchParams }: CourseDetailPageProps) {
  const { courseId } = await params;
  const catalogQuery = normalizeCatalogQuery((await searchParams).catalog);
  const course = getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href={getCatalogReturnHref(catalogQuery)}
        className={buttonVariants({ variant: "ghost", className: "-ml-2" })}
      >
        <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden="true" /> Back to catalog
      </Link>
      <div className="grid items-start gap-8 xl:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 75vw, 50vw"
          />
        </div>
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{course.category}</Badge>
            <Badge>{course.difficulty}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Instructor</dt>
              <dd className="font-medium">{course.instructor}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium">{formatDuration(course.durationMinutes)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="font-medium">{course.rating > 0 ? `★ ${course.rating}` : "Not yet rated"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Enrolled</dt>
              <dd className="font-medium">
                {course.enrolledCount.toLocaleString()} learners
              </dd>
            </div>
          </dl>
          <CourseStartLink course={course} catalogQuery={catalogQuery} />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>
        <LessonChecklist course={course} catalogQuery={catalogQuery} />
      </section>
    </div>
  );
}
