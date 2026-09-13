import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCatalogReturnHref } from "@/lib/catalog-state";

export function CourseCompletionNotice({ completed, total, catalogQuery }: { completed: boolean; total: number; catalogQuery?: string }) {
  return (
    <div className={completed ? "rounded-lg border bg-secondary/40 p-4" : "sr-only"}>
      <div role="status" aria-atomic="true">
        {completed && <p className="flex items-center gap-2 font-semibold text-primary-hover">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          Course complete — {total} of {total} lessons finished.
        </p>}
      </div>
      {completed && <Link href={getCatalogReturnHref(catalogQuery)} className={buttonVariants({ variant: "outline", className: "mt-4" })}>Back to catalog</Link>}
    </div>
  );
}
