"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLessonPlayback } from "@/components/lessons/LessonPlaybackProvider";
import { withCatalogContext } from "@/lib/catalog-state";

export function NextLessonLink({ courseId, lessonId, catalogQuery, className, children }: {
  courseId: string;
  lessonId: string;
  catalogQuery?: string;
  className?: string;
  children: ReactNode;
}) {
  const { request } = useLessonPlayback();
  return (
    <Link
      href={withCatalogContext(`/courses/${courseId}/lessons/${lessonId}`, catalogQuery)}
      className={className}
      // Only same-tab navigation arms playback; prefetch and modifier-clicks do not.
      onNavigate={() => request(courseId, lessonId)}
    >
      {children}
    </Link>
  );
}
