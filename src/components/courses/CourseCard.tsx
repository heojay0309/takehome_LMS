import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, type Course } from "@/lib/courses";

type CourseCardProps = {
  course: Course;
  progressPercent?: number;
};

export function CourseCard({ course, progressPercent }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="group block h-full rounded-xl">
      <Card className="h-full overflow-hidden transition-[box-shadow,transform] duration-[220ms] group-hover:-translate-y-0.5 group-hover:shadow-card">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{course.category}</Badge>
            <Badge>{course.difficulty}</Badge>
          </div>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            {course.instructor} · {formatDuration(course.durationMinutes)} · ★{" "}
            {course.rating}
          </p>
          {typeof progressPercent === "number" && progressPercent > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-progress transition-[width] duration-[380ms]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
