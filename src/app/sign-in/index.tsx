import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/sign-in/")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <SignIn path="/sign-in" routing="path" />
    </main>
  );
}