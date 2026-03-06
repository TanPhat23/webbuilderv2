import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useAcceptInvitation } from "@/hooks";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_protected/accept-invitation")({
  component: AcceptInvitationPage,
});

function AcceptInvitationContent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_protected/accept-invitation" }) as {
    token?: string;
  };
  const token = search.token;

  const [status, setStatus] = useState<
    "idle" | "accepting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptInvitation = useAcceptInvitation();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid invitation link. No token provided.");
      return;
    }

    const handleAccept = async () => {
      setStatus("accepting");
      try {
        await acceptInvitation.mutateAsync({ token });
        setStatus("success");
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 2000);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to accept invitation. The link may have expired or is invalid.",
        );
      }
    };

    handleAccept();
  }, [token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {status === "accepting" && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
            )}
            {status === "error" && (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            {status === "idle" && <Mail className="h-8 w-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "accepting" && "Accepting Invitation..."}
            {status === "success" && "Invitation Accepted!"}
            {status === "error" && "Invitation Failed"}
            {status === "idle" && "Processing Invitation"}
          </CardTitle>
          <CardDescription className="text-base">
            {status === "accepting" &&
              "Please wait while we process your invitation."}
            {status === "success" &&
              "You are now a collaborator on this project. Redirecting to dashboard..."}
            {status === "error" && errorMessage}
            {status === "idle" && "Validating your invitation..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "accepting" && (
            <div className="space-y-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full animate-pulse rounded-full bg-primary"
                  style={{ width: "60%" }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Setting up your collaboration access...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent/50 p-4 text-center">
                <p className="text-sm font-medium text-accent-foreground">
                  Welcome to the team! 🎉
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You now have access to collaborate on this project.
                </p>
              </div>
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-sm text-destructive">
                  Common reasons for this error:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• The invitation link has expired</li>
                  <li>• The invitation has already been accepted</li>
                  <li>• You are already a collaborator on this project</li>
                  <li>• The invitation was revoked by the project owner</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate({ to: "/dashboard" })}
                  variant="outline"
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => navigate({ to: "/help" })}
                  variant="default"
                  className="flex-1"
                >
                  Get Help
                </Button>
              </div>
            </div>
          )}

          {status === "idle" && !token && (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent/50 p-4 text-center">
                <p className="text-sm text-accent-foreground">
                  No invitation token found in the URL.
                </p>
              </div>
              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                variant="outline"
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          <CardDescription className="text-base">
            Processing your invitation...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}