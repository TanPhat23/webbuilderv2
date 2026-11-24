import React, { useState } from "react";
import type { FormElement } from "@/types/elements";
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

export default function FormView({
  element,
  rootProps,
  children,
  data,
  mode,
}: ViewProps<FormElement>): React.ReactElement {
  const settings = element.settings ?? {};
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const collectionId = settings.collectionId?.trim();
  const dataProjectId =
    typeof data?.projectId === "string" ? data.projectId.trim() : undefined;
  const projectId = settings.projectId?.trim() || dataProjectId;
  const isManagedSubmit =
    mode === "preview" && Boolean(collectionId) && Boolean(projectId);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
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

  return (
    <form
      action={isManagedSubmit ? undefined : settings.action}
      method={settings.method || "post"}
      target={settings.target}
      encType={settings.encType}
      acceptCharset={settings.acceptCharset}
      noValidate={settings.noValidate}
      onSubmit={isManagedSubmit ? (e) => void handleSubmit(e) : undefined}
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
