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
      <div className="space-y-4">
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
      <CourseGrid
        courses={filteredCourses}
        progressByCourseId={progressByCourseId}
      />
    </div>
  );
}
