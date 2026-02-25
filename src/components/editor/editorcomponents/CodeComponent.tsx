"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { CodeElement, CodeSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEditorElement, eventsStyle, resolveContent } from "./shared";

const CodeComponent = ({ element, data }: EditorComponentProps) => {
  const codeElement = element as CodeElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(codeElement);
  const commonProps = getCommonProps(codeElement);

  const settings = (codeElement.settings ?? {}) as CodeSettings;
  const language = settings.language ?? "";
  const preformatted = settings.preformatted ?? true;

  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable,
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
        ref={elementRef as React.RefObject<HTMLPreElement>}
        data-element-id={element.id}
        data-element-type={element.type}
        {...commonProps}
        {...eventHandlers}
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          margin: 0,
          position: "relative",
          ...eventsStyle(eventsActive),
        }}
        suppressContentEditableWarning
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
      ref={elementRef as React.RefObject<HTMLElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      data-language={language || undefined}
      {...commonProps}
      {...eventHandlers}
      style={{
        ...safeStyles,
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
        ...eventsStyle(eventsActive),
      }}
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayContent) }}
    />
  );
};

export default CodeComponent;
