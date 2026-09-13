import { getCourses, type Course } from "./courses";

export type Goal = "web" | "data" | "mobile" | "product";
export type Experience = "new" | "intermediate" | "experienced";
export type Answers = { goal: Goal; experience: Experience; interest: string };
export type OnboardingPreference = { version: 2; answers: Answers } | { skipped: true };
export const GOALS: Record<Goal, string> = {
  web: "Frontend Web Developer", data: "Data & Machine Learning",
  mobile: "Mobile Developer", product: "Product & Leadership",
};
export const LEVELS: Record<Experience, string> = {
  new: "New to the field", intermediate: "Comfortable with the basics", experienced: "Experienced — ready to specialize or lead",
};
export function getOnboardingStorageKey(userId: string) { return `betteru-onboarding:${userId}`; }
export function parseOnboardingPreference(raw: string | null): OnboardingPreference | null {
  try {
    const p = JSON.parse(raw ?? "null");
    if (p?.skipped === true) return { skipped: true };
    const a = p?.answers;
    if (p?.version !== 2 || !a || !Object.prototype.hasOwnProperty.call(GOALS, a.goal) || !Object.prototype.hasOwnProperty.call(LEVELS, a.experience)) return null;
    const interests = a.goal === "web" ? ["", "ui", "infra"] : a.goal === "data" ? ["", "analysis", "ml"] : [""];
    if (!interests.includes(a.interest)) return null;
    return { version: 2, answers: { goal: a.goal, experience: a.experience, interest: a.interest } };
  } catch { return null; }
}
export function buildLearningPlan(a: Answers, catalog: Course[] = getCourses()): Course[] {
  let ids: string[];
  if (a.goal === "web") {
    ids = ["react-fundamentals", "typescript-essentials", "nextjs-app-router",
      ...(a.interest === "ui" ? ["ui-design-systems"] : a.interest === "infra" ? ["devops-ci-cd"] : []), "accessible-web"];
  } else if (a.goal === "data") {
    ids = ["sql-analytics", "python-data-analysis", ...(a.experience !== "new" ? ["ml-fundamentals"] : [])];
  } else if (a.goal === "mobile") {
    ids = ["react-fundamentals", "typescript-essentials", "react-native-mobile"];
  } else {
    // Keep the path honest about the supplied 12-course catalog: a short
    // foundation is preferable to inventing extra content to fill a roadmap.
    ids = ["product-management", ...(a.experience === "experienced" ? ["leadership-engineers"] : [])];
  }
  return ids.flatMap(id => {
    const course = catalog.find(c => c.id === `course-${id}`);
    if (!course || (a.experience === "experienced" && ["web", "data"].includes(a.goal) && course.difficulty === "Beginner")) return [];
    return [course];
  });
}
