import React from "react";

interface PreviewCMSFeedbackProps {
  elementId: string;
  styles: React.CSSProperties;
  loading: boolean;
  error: string | null;
}

/**
 * Loading / error placeholder shared by the preview CMS components. Renders
 * nothing when the fetch is idle or finished, so callers can use
 * `PreviewCMSFeedback.isActive(...)` to decide whether to return it early.
 */
export function PreviewCMSFeedback({
  elementId,
  styles,
  loading,
  error,
}: PreviewCMSFeedbackProps) {
  return (
    <div
      id={elementId}
      data-element-id={elementId}
      style={{
        ...styles,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(!loading && error ? { color: "red" } : {}),
      }}
    >
      {loading ? "Loading content..." : `Error: ${error}`}
    </div>
  );
}

PreviewCMSFeedback.isActive = (loading: boolean, error: string | null) =>
  loading || error !== null;
