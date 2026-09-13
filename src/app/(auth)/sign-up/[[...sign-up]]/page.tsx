import { SignUp } from "@clerk/nextjs";
import { AuthFormSkeleton } from "@/components/layout/AuthFormSkeleton";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return <SignUp appearance={clerkAppearance} fallback={<AuthFormSkeleton />} />;
}
