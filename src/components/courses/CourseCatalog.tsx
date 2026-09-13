"use client";

import { useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useProgressState } from "@/components/courses/CourseProgressProvider";
import { CourseGridSkeleton } from "@/components/courses/CourseSkeletons";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { Filters } from "@/components/courses/Filters";
import { SearchBar } from "@/components/courses/SearchBar";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { filterCourses, getCategories, getDifficulties, type Course } from "@/lib/courses";
import { DEFAULT_CATALOG_STATE, normalizeCatalogQuery, readCatalogState, updateCatalogQuery, type CatalogState } from "@/lib/catalog-state";
import { EMPTY_PROGRESS, getCourseProgressSummary } from "@/lib/progress";

export function CourseCatalog({ courses }: { courses: Course[] }) {
  const { snapshot } = useProgressState();
  const searchParams = useSearchParams();
  const state = readCatalogState(searchParams);
  const searchInput = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebouncedValue(state.search);
  // Clearing is immediate; typing still waits 300ms before filtering.
  const effectiveSearch = state.search ? debouncedSearch : "";
  const isSearching = state.search !== effectiveSearch;
  const hasFilters = Boolean(state.search || state.category || state.difficulty || state.completionStatus !== "all");

  function updateFilters(patch: Partial<CatalogState>) {
    // Native history integrates with Next's useSearchParams without a server
    // navigation per keystroke. Read the live URL so rapid edits cannot race.
    const query = updateCatalogQuery(window.location.search, patch);
    window.history.replaceState(null, "", `${query ? `/?${query}` : "/"}${window.location.hash}`);
  }

  function clearFilters() {
    updateFilters(DEFAULT_CATALOG_STATE);
    searchInput.current?.focus();
  }

  const progressByCourseId = useMemo(() => Object.fromEntries(
    courses.map((course) => [course.id, getCourseProgressSummary(course, snapshot?.courses[course.id] ?? EMPTY_PROGRESS).percent]),
  ), [courses, snapshot]);
  const filteredCourses = filterCourses({ ...state, search: effectiveSearch }, progressByCourseId, courses);

  return (
    <div className="catalog-surface space-y-8">
      <div className="catalog-toolbar">
        <SearchBar inputRef={searchInput} value={state.search} onChange={(search) => updateFilters({ search })} />
        <Filters
          categories={getCategories()}
          difficulties={getDifficulties()}
          category={state.category}
          difficulty={state.difficulty}
          completionStatus={state.completionStatus}
          onCompletionStatusChange={(completionStatus) => updateFilters({ completionStatus })}
          onCategoryChange={(category) => updateFilters({ category })}
          onDifficultyChange={(difficulty) => updateFilters({ difficulty })}
        />
      </div>
      <div className="space-y-8">
        <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p role="status" className="text-sm text-muted-foreground">
            {snapshot === null ? "Loading courses…" : isSearching ? "Updating results…" : `${filteredCourses.length} ${filteredCourses.length === 1 ? "course" : "courses"} to explore`}
          </p>
          {hasFilters && <Button variant="ghost" onClick={clearFilters}>Clear search and filters</Button>}
        </div>
        <div aria-busy={snapshot === null || isSearching}>
          {snapshot === null || (isSearching && filteredCourses.length === 0) ? <CourseGridSkeleton /> : (
            <CourseGrid
              courses={filteredCourses}
              progressByCourseId={progressByCourseId}
              catalogQuery={normalizeCatalogQuery(searchParams.toString())}
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
}
