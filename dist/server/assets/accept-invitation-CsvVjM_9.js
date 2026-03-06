import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Suspense, useState, useEffect } from "react";
import { B as Button } from "./prisma-Cq49YOYM.js";
import "sonner";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-LOcGasZb.js";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import "clsx";
import { u as useAcceptInvitation } from "./useInvitations-DGnxt-hT.js";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function AcceptInvitationContent() {
  const navigate = useNavigate();
  const search = useSearch({
    from: "/_protected/accept-invitation"
  });
  const token = search.token;
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
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
        await acceptInvitation.mutateAsync({
          token
        });
        setStatus("success");
        setTimeout(() => {
          navigate({
            to: "/dashboard"
          });
        }, 2e3);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Failed to accept invitation. The link may have expired or is invalid.");
      }
    };
    handleAccept();
  }, [token]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen w-full items-center justify-center bg-background p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md shadow-lg", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10", children: [
        status === "accepting" && /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
        status === "success" && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-8 w-8 text-accent-foreground" }),
        status === "error" && /* @__PURE__ */ jsx(XCircle, { className: "h-8 w-8 text-destructive" }),
        status === "idle" && /* @__PURE__ */ jsx(Mail, { className: "h-8 w-8 text-primary" })
      ] }),
      /* @__PURE__ */ jsxs(CardTitle, { className: "text-2xl font-bold", children: [
        status === "accepting" && "Accepting Invitation...",
        status === "success" && "Invitation Accepted!",
        status === "error" && "Invitation Failed",
        status === "idle" && "Processing Invitation"
      ] }),
      /* @__PURE__ */ jsxs(CardDescription, { className: "text-base", children: [
        status === "accepting" && "Please wait while we process your invitation.",
        status === "success" && "You are now a collaborator on this project. Redirecting to dashboard...",
        status === "error" && errorMessage,
        status === "idle" && "Validating your invitation..."
      ] })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      status === "accepting" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsx("div", { className: "h-full animate-pulse rounded-full bg-primary", style: {
          width: "60%"
        } }) }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Setting up your collaboration access..." })
      ] }),
      status === "success" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-accent/50 p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-accent-foreground", children: "Welcome to the team! 🎉" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "You now have access to collaborate on this project." })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => navigate({
          to: "/dashboard"
        }), className: "w-full", children: "Go to Dashboard" })
      ] }),
      status === "error" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-destructive/10 p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: "Common reasons for this error:" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("li", { children: "• The invitation link has expired" }),
            /* @__PURE__ */ jsx("li", { children: "• The invitation has already been accepted" }),
            /* @__PURE__ */ jsx("li", { children: "• You are already a collaborator on this project" }),
            /* @__PURE__ */ jsx("li", { children: "• The invitation was revoked by the project owner" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { onClick: () => navigate({
            to: "/dashboard"
          }), variant: "outline", className: "flex-1", children: "Go to Dashboard" }),
          /* @__PURE__ */ jsx(Button, { onClick: () => navigate({
            to: "/help"
          }), variant: "default", className: "flex-1", children: "Get Help" })
        ] })
      ] }),
      status === "idle" && !token && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-accent/50 p-4 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-accent-foreground", children: "No invitation token found in the URL." }) }),
        /* @__PURE__ */ jsx(Button, { onClick: () => navigate({
          to: "/dashboard"
        }), variant: "outline", className: "w-full", children: "Return to Dashboard" })
      ] })
    ] })
  ] }) });
}
function LoadingFallback() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen w-full items-center justify-center bg-background p-4", children: /* @__PURE__ */ jsx(Card, { className: "w-full max-w-md shadow-lg", children: /* @__PURE__ */ jsxs(CardHeader, { className: "text-center space-y-2", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }),
    /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Loading..." }),
    /* @__PURE__ */ jsx(CardDescription, { className: "text-base", children: "Processing your invitation..." })
  ] }) }) });
}
function AcceptInvitationPage() {
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(LoadingFallback, {}), children: /* @__PURE__ */ jsx(AcceptInvitationContent, {}) });
}
export {
  AcceptInvitationPage as component
};
