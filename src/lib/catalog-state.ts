import { getDifficulties, resolveCategoryParam, type CourseFilters } from "./courses";

export type CatalogState = Required<CourseFilters>;
export const DEFAULT_CATALOG_STATE: CatalogState = {
  search: "", category: "", difficulty: "", completionStatus: "all",
};

export function readCatalogState(params: Pick<URLSearchParams, "get">): CatalogState {
  const difficulty = params.get("difficulty");
  const status = params.get("status");
  return {
    search: params.get("q") ?? "",
    category: resolveCategoryParam(params.get("category")),
    difficulty: getDifficulties().find((value) => value === difficulty) ?? "",
    completionStatus: status === "in-progress" || status === "completed" ? status : "all",
  };
}

/** Preserve unrelated URL state (such as the selected track) during filter edits. */
export function updateCatalogQuery(query: string, patch: Partial<CatalogState>): string {
  const params = new URLSearchParams(query);
  const keys = { search: "q", category: "category", difficulty: "difficulty", completionStatus: "status" } as const;
  for (const key of Object.keys(keys) as Array<keyof CatalogState>) {
    const value = patch[key];
    if (value === undefined) continue;
    if (!value || (key === "completionStatus" && value === "all")) params.delete(keys[key]);
    else params.set(keys[key], value);
  }
  return params.toString();
}

/** Carry only validated filters, never a caller-provided redirect URL. */
export function normalizeCatalogQuery(value: string | string[] | undefined): string {
  const query = Array.isArray(value) ? value[0] : value;
  return updateCatalogQuery("", readCatalogState(new URLSearchParams(query)));
}

export function withCatalogContext(path: string, catalogQuery?: string): string {
  const query = normalizeCatalogQuery(catalogQuery);
  return query ? `${path}?catalog=${encodeURIComponent(query)}` : path;
}

export function getCatalogReturnHref(catalogQuery?: string): string {
  const query = normalizeCatalogQuery(catalogQuery);
  return `${query ? `/?${query}` : "/"}#catalog`;
}
