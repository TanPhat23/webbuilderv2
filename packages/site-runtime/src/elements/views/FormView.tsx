import React, { useState } from "react";
import type { FormElement } from "../../types/elements";
import { useSiteNavigationOptional } from "../context/SiteNavigationContext";
import { sanitizeRedirectPath } from "../../lib/site-auth";
import { buildSiteHref } from "../../lib/site-routing";
import type { ViewProps } from "../view-props";
import {
  extractFormPayload,
  submitFormToCollection,
} from "../utils/formSubmission";

type SubmitState =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "success"; readonly message: string }
  | {
      readonly status: "error";
      readonly message: string;
      readonly fields?: Readonly<Record<string, string>>;
    };

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  return typeof envUrl === "string" && envUrl.length > 0
    ? envUrl
    : "http://localhost:8080";
}

function readStringField(
  payload: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

function readRecordError(body: unknown, fallback: string): string {
  if (body !== null && typeof body === "object" && "error" in body) {
    const err = (body as Record<string, unknown>).error;
    if (typeof err === "string" && err.trim().length > 0) return err.trim();
  }
  return fallback;
}

export default function FormView({
  element,
  rootProps,
  children,
  data,
  mode,
}: ViewProps<FormElement>): React.ReactElement {
  const siteNav = useSiteNavigationOptional();
  const settings = element.settings ?? {};
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const authAction = settings.authAction;
  const collectionId = settings.collectionId?.trim();
  const dataProjectId =
    typeof data?.projectId === "string" ? data.projectId.trim() : undefined;
  const projectId =
    settings.projectId?.trim() || siteNav?.projectId || dataProjectId;
  const isAuthSubmit = mode === "preview" && Boolean(authAction);
  const isManagedSubmit =
    !isAuthSubmit &&
    mode === "preview" &&
    Boolean(collectionId) &&
    Boolean(projectId);

  const handleAuthSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    if (!authAction) return;
    event.preventDefault();
    if (!projectId) {
      setSubmitState({
        status: "error",
        message: "Site authentication is unavailable for this preview.",
      });
      return;
    }

    const formEl = event.currentTarget;
    const payload = extractFormPayload(formEl);
    setSubmitState({ status: "submitting" });

    const queryNext =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
    const configuredRedirect = settings.redirectUrl?.trim()
      ? siteNav
        ? buildSiteHref(siteNav.mode, settings.redirectUrl.trim())
        : settings.redirectUrl.trim()
      : undefined;
    const defaultHome = siteNav ? buildSiteHref(siteNav.mode, "/") : "/";
    const nextPath = sanitizeRedirectPath(
      queryNext || configuredRedirect,
      defaultHome,
    );

    try {
      if (authAction === "logout") {
        const res = await fetch("/api/site-auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        if (!res.ok) {
          const body: unknown = await res.json().catch(() => null);
          setSubmitState({
            status: "error",
            message: readRecordError(body, "Unable to sign out."),
          });
          return;
        }
        window.location.assign(configuredRedirect || defaultHome);
        return;
      }

      const email = readStringField(payload, ["email", "Email"]);
      const password =
        typeof payload.password === "string"
          ? payload.password
          : typeof payload.Password === "string"
            ? payload.Password
            : "";
      const name = readStringField(payload, [
        "name",
        "fullName",
        "full_name",
        "Name",
      ]);

      const endpoint =
        authAction === "login"
          ? "/api/site-auth/login"
          : authAction === "signup"
            ? "/api/site-auth/signup"
            : "/api/site-auth/magic-link";
      const requestBody =
        authAction === "magic-link"
          ? { projectId, email, next: nextPath }
          : authAction === "signup"
            ? {
                projectId,
                email,
                password,
                ...(name ? { name } : {}),
                next: nextPath,
              }
            : { projectId, email, password, next: nextPath };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const body: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setSubmitState({
          status: "error",
          message: readRecordError(body, "Authentication failed."),
        });
        return;
      }

      if (authAction === "magic-link") {
        formEl.reset();
        setSubmitState({
          status: "success",
          message:
            settings.successMessage?.trim() ||
            "Check your email for a sign-in link.",
        });
        return;
      }

      const confirmationRequired =
        body !== null &&
        typeof body === "object" &&
        "confirmationRequired" in body &&
        (body as Record<string, unknown>).confirmationRequired === true;

      if (confirmationRequired) {
        formEl.reset();
        setSubmitState({
          status: "success",
          message:
            settings.successMessage?.trim() ||
            "Check your email to confirm your account.",
        });
        return;
      }

      const redirectTo =
        body !== null &&
        typeof body === "object" &&
        "redirectTo" in body &&
        typeof (body as Record<string, unknown>).redirectTo === "string"
          ? sanitizeRedirectPath(
              (body as Record<string, string>).redirectTo,
              defaultHome,
            )
          : nextPath;

      window.location.assign(redirectTo);
    } catch {
      setSubmitState({
        status: "error",
        message: "Network error. Please try again.",
      });
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    if (isAuthSubmit) {
      await handleAuthSubmit(event);
      return;
    }
    if (!isManagedSubmit || !collectionId || !projectId) {
      return;
    }
    event.preventDefault();
    const formEl = event.currentTarget;
    setSubmitState({ status: "submitting" });

    const payload = extractFormPayload(formEl);
    const result = await submitFormToCollection({
      apiBaseUrl: resolveApiBaseUrl(),
      projectId,
      collectionId,
      payload,
    });

    if (result.ok) {
      formEl.reset();
      const message =
        settings.successMessage?.trim() ||
        "Thanks! Your submission was received.";
      setSubmitState({ status: "success", message });
      if (settings.redirectUrl && settings.redirectUrl.trim().length > 0) {
        window.location.assign(settings.redirectUrl.trim());
      }
      return;
    }

    setSubmitState({
      status: "error",
      message: result.message,
      fields: result.kind === "validation" ? result.fields : undefined,
    });
  };

  const interceptSubmit = isAuthSubmit || isManagedSubmit;

  return (
    <form
      action={interceptSubmit ? undefined : settings.action}
      method={settings.method || "post"}
      target={settings.target}
      encType={settings.encType}
      acceptCharset={settings.acceptCharset}
      noValidate={settings.noValidate}
      onSubmit={interceptSubmit ? (e) => void handleSubmit(e) : undefined}
      aria-busy={submitState.status === "submitting"}
      {...rootProps}
    >
      {isManagedSubmit && (
        <input
          type="text"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
          }}
        />
      )}
      {children}
      {submitState.status === "success" && (
        <div
          role="status"
          className="mt-3 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
        >
          {submitState.message}
        </div>
      )}
      {submitState.status === "error" && (
        <div
          role="alert"
          className="mt-3 flex flex-col gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <span>{submitState.message}</span>
          {submitState.fields && Object.keys(submitState.fields).length > 0 && (
            <ul className="list-disc pl-4 text-xs">
              {Object.entries(submitState.fields).map(([field, err]) => (
                <li key={field}>
                  {field}: {err}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
