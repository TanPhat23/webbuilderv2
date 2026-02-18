"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { CodeElement, CodeSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const CodeComponent = ({ element, data }: EditorComponentProps) => {
  const codeElement = element as CodeElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(codeElement);
  const commonProps = getCommonProps(codeElement);
  const isEditing = commonProps.contentEditable;

  const settings = (codeElement.settings ?? {}) as CodeSettings;
  const language = settings.language ?? "";
  const preformatted = settings.preformatted ?? true;

  let content =
    (typeof data === "string" ? data : "") ||
    (typeof data === "object" && data && typeof data.content === "string"
      ? data.content
      : "") ||
    (typeof element.content === "string" ? element.content : "") ||
    "";

  if (typeof element.content === "string" && data && typeof data === "object") {
    content = elementHelper.replacePlaceholders(element.content, data);
  }

  const displayContent = isEditing ? element.content : content;

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

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
          cursor: eventsActive ? "pointer" : "inherit",
          userSelect: eventsActive ? "none" : "auto",
          position: "relative",
        }}
        suppressContentEditableWarning={true}
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

  // Inline code rendering (preformatted = false)
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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
      suppressContentEditableWarning={true}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(displayContent),
      }}
    />
  );
};

export default CodeComponent;
