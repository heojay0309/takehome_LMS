import Image from 'next/image';
import Link from 'next/link';
import { CourseProgressBar } from '@/components/courses/CourseProgressBar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDuration, type Course } from '@/lib/courses';
import { withCatalogContext } from '@/lib/catalog-state';

type CourseCardProps = {
  course: Course;
  progressPercent?: number;
  catalogQuery?: string;
};

export function CourseCard({
  course,
  progressPercent = 0,
  catalogQuery,
}: CourseCardProps) {
  return (
    <Link
      href={withCatalogContext(`/courses/${course.id}`, catalogQuery)}
      className="group block h-full rounded-xl"
    >
      <Card className="flex h-full min-w-0 flex-col overflow-hidden transition-[box-shadow,transform] duration-[220ms] group-hover:-translate-y-0.5 group-hover:shadow-card">
        <div className="relative aspect-video shrink-0 overflow-hidden bg-muted">
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, (max-width: 1279px) 40vw, 33vw"
          />
        </div>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{course.category}</Badge>
            <Badge>{course.difficulty}</Badge>
            {progressPercent === 100 && (
              <Badge className="border border-primary">Completed</Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto space-y-4 text-sm text-muted-foreground">
          <p className="min-h-12">
            {course.instructor} · {formatDuration(course.durationMinutes)} ·{' '}
            {course.rating > 0 ? `★ ${course.rating}` : 'Not yet rated'}
          </p>
          <CourseProgressBar percent={progressPercent} />
        </CardContent>
      </Card>
    </Link>
  );
}
