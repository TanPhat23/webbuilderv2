import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/sign-up/$")({
  component: SignUpCatchAllPage,
});

function SignUpCatchAllPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <SignUp path="/sign-up" routing="path" />
    </main>
  );
}