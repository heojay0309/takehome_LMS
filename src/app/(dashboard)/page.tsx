import Link from "next/link";
import { ArrowDown, BookOpen, Layers, Compass } from "lucide-react";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { buttonVariants } from "@/components/ui/button";
import { getCategories, getCourses } from "@/lib/courses";

export default function CourseCatalogPage() {
  const courses = getCourses();

  return (
    <div className="space-y-10">
      <section aria-labelledby="welcome-heading" className="violet-veil overflow-hidden rounded-xl p-6 text-white sm:p-10">
        <div className="grid gap-8 xl:grid-cols-[1fr_15rem] xl:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">A little learning. A better you.</p>
            <h1 id="welcome-heading" className="mt-4 max-w-xl text-3xl leading-tight sm:text-4xl xl:text-5xl">
              Make room for what&apos;s next.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
              Follow your curiosity, build a new skill, or take the next small step.
              This is your space to learn at your own pace.
            </p>
            <Link href="#catalog" className={buttonVariants({ className: "mt-6" })}>
              Explore courses <ArrowDown className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-6">
            <Compass className="mb-4 size-8 text-encouragement" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-heading text-xl font-semibold">Start with curiosity.</p>
            <p className="mt-2 text-sm text-white/80">You don&apos;t need to have it all figured out. Just choose something that interests you.</p>
          </div>
        </div>
      </section>
      <section id="catalog" aria-labelledby="catalog-heading" className="scroll-mt-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary-hover uppercase">Find your next step</p>
            <h2 id="catalog-heading" className="text-3xl">Explore the catalog</h2>
            <p className="mt-2 text-muted-foreground">A new perspective is just a lesson away.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><BookOpen className="size-4" aria-hidden="true" />{courses.length} courses</span>
            <span className="inline-flex items-center gap-2"><Layers className="size-4" aria-hidden="true" />{getCategories().length} categories</span>
          </div>
        </div>
        <CourseCatalog courses={courses} />
      </section>
    </div>
  );
}
