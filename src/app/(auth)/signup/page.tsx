import { AuthForm } from "@/components/features/auth";

export default function SignupPage() {
  return (
    <main className="flex-1">
      <AuthForm mode="signup" />
    </main>
  );
}
