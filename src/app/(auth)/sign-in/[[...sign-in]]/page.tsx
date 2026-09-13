import { SignIn } from "@clerk/nextjs";
import { AuthFormSkeleton } from "@/components/layout/AuthFormSkeleton";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return <SignIn appearance={clerkAppearance} fallback={<AuthFormSkeleton />} />;
}
