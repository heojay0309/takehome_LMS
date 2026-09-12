"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Filters } from "@/components/courses/Filters";
import { SearchBar } from "@/components/courses/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  filterCourses,
  getCategories,
  getDifficulties,
  type Course,
  type Difficulty,
} from "@/lib/courses";
import { getCourseProgressPercent } from "@/lib/progress";

type CourseCatalogProps = {
  courses: Course[];
};

export function CourseCatalog({ courses }: CourseCatalogProps) {
  const { user } = useUser();
  const userId = user?.id ?? "guest";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const filteredCourses = useMemo(
    () =>
      filterCourses({
        search: debouncedSearch,
        category,
        difficulty,
      }),
    [debouncedSearch, category, difficulty],
  );

  const progressByCourseId = useMemo(() => {
    return Object.fromEntries(
      courses.map((course) => [
        course.id,
        getCourseProgressPercent(userId, course),
      ]),
    );
  }, [courses, userId]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-card xl:grid-cols-[1fr_1.4fr] xl:items-end">
        <SearchBar value={search} onChange={setSearch} />
        <Filters
          categories={getCategories()}
          difficulties={getDifficulties()}
          category={category}
          difficulty={difficulty}
          onCategoryChange={setCategory}
          onDifficultyChange={setDifficulty}
        />
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} to explore
      </p>
      <CourseGrid
        courses={filteredCourses}
        progressByCourseId={progressByCourseId}
      />
    </div>
  );
}
