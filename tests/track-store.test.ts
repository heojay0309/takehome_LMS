import assert from "node:assert/strict";
import { test } from "node:test";
import { createTrackStore, parseTrackLibrary } from "../src/lib/track-store";
import { buildLearningPlan, type Answers } from "../src/lib/onboarding";
import { getAllLessons, getCourses } from "../src/lib/courses";
const product: Answers = {goal:"product",experience:"new",interest:""};
const web: Answers = {goal:"web",experience:"intermediate",interest:"ui"};
test("legacy path migrates and malformed tracks are discarded", () => {
  assert.deepEqual(parseTrackLibrary(JSON.stringify({version:2,answers:product})).tracks, [product]);
  assert.equal(parseTrackLibrary("{").tracks.length, 0);
  assert.deepEqual(parseTrackLibrary(JSON.stringify({version:3,tracks:[product,product,{goal:"bad"}]})).tracks, [product]);
});
test("multiple tracks persist, update without duplication, notify and isolate users", () => {
  const data = new Map<string,string>();
  const storage = {getItem:(k:string) => data.get(k) ?? null,setItem:(k:string,v:string) => {data.set(k,v);}};
  const a = createTrackStore("a", () => storage);
  let notifications = 0;
  a.subscribe(() => {notifications++;});
  a.save({version:2,answers:product}); a.save({version:2,answers:web});
  a.save({version:2,answers:{...product,experience:"experienced"}});
  assert.equal(a.getSnapshot().library.tracks.length, 2);
  assert.equal(notifications, 3);
  assert.equal(createTrackStore("a", () => storage).getSnapshot().library.tracks.length, 2);
  assert.equal(createTrackStore("b", () => storage).getSnapshot().library.tracks.length, 0);
  const second = createTrackStore("a", () => storage);
  second.getSnapshot();
  a.save({version:2,answers:{...web,interest:"infra"}});
  second.refresh("unrelated");
  assert.equal(second.getSnapshot().library.tracks.find(t=>t.goal==='web')?.interest, 'ui');
  second.refresh("betteru-onboarding:a");
  assert.equal(second.getSnapshot().library.tracks.find(t=>t.goal==='web')?.interest, 'infra');
});
test("blocked storage retains saved tracks in memory", () => {
  const store = createTrackStore("a", () => {throw Error("blocked");});
  store.save({version:2,answers:product});
  store.save({version:2,answers:web});
  assert.equal(store.getSnapshot().library.tracks.length, 2);
  assert.equal(store.getSnapshot().storageAvailable, false);
});
test("archives persist separately, restore answers, notify, and never touch lesson progress", () => {
  const progressKey = "betteru-progress:a:course-product-management";
  const data = new Map<string, string>([[progressKey, '{"completedLessonIds":["lesson-1"]}']]);
  const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
  const store = createTrackStore("a", () => storage);
  store.save({ version: 2, answers: product });
  store.save({ version: 2, answers: web });
  let notifications = 0;
  store.subscribe(() => { notifications++; });
  store.archive("product");
  store.archive("product");
  assert.equal(notifications, 1);
  assert.deepEqual(store.getSnapshot().library.tracks, [web]);
  assert.deepEqual(store.getSnapshot().library.archivedTracks, [product]);
  const second = createTrackStore("a", () => storage);
  assert.deepEqual(second.getSnapshot().library.archivedTracks, [product]);
  assert.deepEqual(createTrackStore("b", () => storage).getSnapshot().library.archivedTracks, []);
  second.restore("product");
  store.refresh("betteru-onboarding:a");
  assert.deepEqual(store.getSnapshot().library.archivedTracks, []);
  assert.deepEqual(store.getSnapshot().library.tracks, [web, product]);
  assert.equal(data.get(progressKey), '{"completedLessonIds":["lesson-1"]}');
});

test("archive migration sanitizes entries and active tracks win duplicate goals", () => {
  const legacy = parseTrackLibrary(JSON.stringify({ version: 3, tracks: [product, web] }));
  assert.equal(legacy.version, 4);
  assert.deepEqual(legacy.archivedTracks, []);
  const library = parseTrackLibrary(JSON.stringify({ version: 4, tracks: [web], archivedTracks: [web, product, product, null, { goal: "bad" }] }));
  assert.deepEqual(library.tracks, [web]);
  assert.deepEqual(library.archivedTracks, [product]);
});

test("re-saving an archived goal restores it without duplicates and blocked writes retain archive changes", () => {
  const store = createTrackStore("a", () => { throw Error("blocked"); });
  store.save({ version: 2, answers: product });
  store.archive("product");
  assert.equal(store.getSnapshot().storageAvailable, false);
  assert.deepEqual(store.getSnapshot().library.tracks, []);
  assert.deepEqual(store.getSnapshot().library.archivedTracks, [product]);
  store.restore("product");
  assert.deepEqual(store.getSnapshot().library.tracks, [product]);
  store.archive("product");
  const changed = { ...product, experience: "experienced" as const };
  store.save({ version: 2, answers: changed });
  assert.deepEqual(store.getSnapshot().library.tracks, [changed]);
  assert.deepEqual(store.getSnapshot().library.archivedTracks, []);
});

test("archive actions read other-tab additions before writing", () => {
  const data = new Map<string, string>();
  const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); } };
  const first = createTrackStore("a", () => storage);
  const second = createTrackStore("a", () => storage);
  first.save({ version: 2, answers: product });
  second.save({ version: 2, answers: web });
  first.archive("product");
  assert.deepEqual(first.getSnapshot().library.tracks, [web]);
  assert.deepEqual(first.getSnapshot().library.archivedTracks, [product]);
});

test("Product paths use only the supplied 12 courses and retain unique identifiers", () => {
  for (const experience of ["new","intermediate"] as const) {
    const plan = buildLearningPlan({...product,experience});
    assert.deepEqual(plan.map(course => course.id), ["course-product-management"]);
    assert.ok(plan.every(c => c.difficulty !== 'Advanced' && getAllLessons(c).length >= 4));
  }
  const courses = getCourses();
  assert.equal(courses.length, 12);
  assert.deepEqual(buildLearningPlan({...product,experience:"experienced"}).map(course => course.id), ["course-product-management", "course-leadership-engineers"]);
  assert.equal(new Set(courses.map(c=>c.id)).size, courses.length);
  const lessons = courses.flatMap(getAllLessons);
  assert.equal(new Set(lessons.map(l=>l.id)).size, lessons.length);
});
