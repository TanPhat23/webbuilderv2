
import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { EditorComponentProps } from "@/features/editor";
import { CodeElement, CodeSettings } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useCanvasElement, resolveContent } from "./shared";

const CodeComponent = ({ element, data }: EditorComponentProps) => {
  const codeElement = element as CodeElement;
  const { rootProps, isEditing } = useCanvasElement(codeElement);
  const safeStyles = elementHelper.getSafeStyles(codeElement);

  const settings = (codeElement.settings ?? {}) as CodeSettings;
  const language = settings.language ?? "";
  const preformatted = settings.preformatted ?? true;

  const displayContent = resolveContent(
    element,
    data,
    isEditing,
  );

  const codeInnerStyle: React.CSSProperties = {
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: "inherit",
    background: "transparent",
    display: "block",
    whiteSpace: "pre",
    overflowX: "auto",
    tabSize: 2,
  };

  if (preformatted) {
    return (
      <pre
        {...rootProps}
        style={{ margin: 0, position: "relative", ...rootProps.style }}
      >
        {language && (
          <span
            style={{
              position: "absolute",
              top: "8px",
              right: "12px",
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text-muted, #94a3b8)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              pointerEvents: "none",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            {language}
          </span>
        )}
        <code
          data-language={language || undefined}
          style={codeInnerStyle}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(displayContent),
          }}
        />
      </pre>
    );
  }

  return (
    <code
      {...rootProps}
      data-language={language || undefined}
      style={{
        ...rootProps.style,
        display: "inline",
        padding: "2px 6px",
        borderRadius: "4px",
        backgroundColor:
          safeStyles.backgroundColor ?? "var(--bg-code-inline, #f1f5f9)",
        color: safeStyles.color ?? "var(--text-code-inline, #e11d48)",
        fontSize: safeStyles.fontSize ?? "0.875em",
        fontFamily:
          safeStyles.fontFamily ??
          "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
      }}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayContent) }}
    />
  );
};

export default CodeComponent;
