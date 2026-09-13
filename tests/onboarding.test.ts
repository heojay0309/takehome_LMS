import assert from "node:assert/strict";
import { test } from "node:test";
import { buildLearningPlan, parseOnboardingPreference, getOnboardingStorageKey, type Answers } from "../src/lib/onboarding";
const ids = (a: Answers) => buildLearningPlan(a).map(c => c.id.replace("course-", ""));
test("web sequences use curated prerequisites and optional branches", () => {
  assert.deepEqual(ids({goal:"web",experience:"new",interest:"ui"}), ["react-fundamentals","typescript-essentials","nextjs-app-router","ui-design-systems","accessible-web"]);
  assert.ok(ids({goal:"web",experience:"intermediate",interest:"infra"}).includes("devops-ci-cd"));
  assert.ok(!ids({goal:"web",experience:"experienced",interest:""}).includes("react-fundamentals"));
});
test("advanced ML and leadership recommendations respect experience", () => {
  assert.deepEqual(ids({goal:"data",experience:"new",interest:"ml"}), ["sql-analytics","python-data-analysis"]);
  assert.deepEqual(ids({goal:"data",experience:"experienced",interest:"analysis"}), ["ml-fundamentals"]);
  assert.ok(ids({goal:"data",experience:"intermediate",interest:"ml"}).includes("ml-fundamentals"));
  assert.deepEqual(ids({goal:"product",experience:"new",interest:""}), ["product-management"]);
  assert.deepEqual(ids({goal:"product",experience:"experienced",interest:""}), ["product-management","leadership-engineers"]);
});
test("mobile includes cross-category foundations in order", () => {
  assert.deepEqual(ids({goal:"mobile",experience:"new",interest:""}), ["react-fundamentals","typescript-essentials","react-native-mobile"]);
});
test("storage validates version, answers, legacy and corrupt data", () => {
  for (const raw of [null, "{", '{}', '{"track":"Design"}', '{"version":2,"answers":{"goal":"toString","experience":"new","interest":""}}']) assert.equal(parseOnboardingPreference(raw), null);
  const preference = {version:2,answers:{goal:"web",experience:"new",interest:"ui"}};
  assert.deepEqual(parseOnboardingPreference(JSON.stringify(preference)), preference);
  assert.deepEqual(parseOnboardingPreference('{"skipped":true}'), {skipped:true});
  assert.notEqual(getOnboardingStorageKey("a"), getOnboardingStorageKey("b"));
});
