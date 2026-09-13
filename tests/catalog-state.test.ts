import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CATALOG_STATE, getCatalogReturnHref, normalizeCatalogQuery, readCatalogState, updateCatalogQuery, withCatalogContext } from "../src/lib/catalog-state";

test("all filters survive URL serialization, reload and return navigation", () => {
  const state = { search: "React & state / hooks?", category: "Web Development", difficulty: "Beginner", completionStatus: "in-progress" } as const;
  const query = updateCatalogQuery("", state);
  assert.deepEqual(readCatalogState(new URLSearchParams(query)), state);
  const href = withCatalogContext("/courses/react/lessons/one", query);
  const context = new URL(href, "https://example.test").searchParams.get("catalog") ?? "";
  assert.equal(context, query);
  assert.equal(getCatalogReturnHref(context), `/?${query}#catalog`);
  assert.equal(withCatalogContext("/courses/react", context), `/courses/react?catalog=${encodeURIComponent(query)}`);
});

test("filter edits preserve other filters and selected tracks; reset removes only filters", () => {
  const initial = "track=web&q=react&category=Web+Development&difficulty=Beginner&status=in-progress";
  const changed = updateCatalogQuery(initial, { difficulty: "Intermediate" });
  const params = new URLSearchParams(changed);
  assert.equal(params.get("track"), "web");
  assert.equal(params.get("q"), "react");
  assert.equal(params.get("status"), "in-progress");
  assert.equal(params.get("difficulty"), "Intermediate");
  assert.equal(updateCatalogQuery(changed, DEFAULT_CATALOG_STATE), "track=web");
  assert.deepEqual(readCatalogState(new URLSearchParams()), DEFAULT_CATALOG_STATE);
});

test("invalid URL values fall back safely and return context cannot become an external redirect", () => {
  assert.deepEqual(readCatalogState(new URLSearchParams("category=unknown&difficulty=Expert&status=started")), DEFAULT_CATALOG_STATE);
  assert.equal(normalizeCatalogQuery("track=web&unexpected=hello&status=completed"), "status=completed");
  assert.equal(normalizeCatalogQuery(["q=first", "q=second"]), "q=first");
  for (const input of [undefined, "https://evil.test", "//evil.test", "javascript:alert(1)", "catalog=q%3Drecursive"]) {
    assert.equal(getCatalogReturnHref(input), "/#catalog");
  }
  assert.equal(withCatalogContext("/courses/react", ""), "/courses/react");
});
