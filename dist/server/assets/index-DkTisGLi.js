import { p as useEditorElement, q as useElementHandler, r as resolveContent, s as eventsStyle, t as useMediaDrop, D as DropOverlay, E as ElementLoader, C as CMSContentGridComponent, f as CMSContentItemComponent, g as CMSContentListComponent, L as ListComponent, h as CarouselComponent, k as SectionComponent, F as FrameComponent, i as FormComponent, S as SelectComponent, I as InputComponent, B as BaseComponent, l as ButtonComponent, j as ImageComponent } from "./SelectComponent-Bh8IGRc1.js";
import { jsx, jsxs } from "react/jsx-runtime";
import DOMPurify from "isomorphic-dompurify";
import React__default from "react";
import "./project.service-Bci2lGYe.js";
import { i as elementHelper, U as Empty, V as EmptyHeader, W as EmptyMedia, X as EmptyTitle, Y as EmptyDescription, h as cn } from "./prisma-BUnO9f9X.js";
import "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { DynamicIcon } from "lucide-react/dynamic.mjs";
import { Smile, Globe, Volume2, Video } from "lucide-react";
import "framer-motion";
import "@tanstack/react-query";
import "./carousel-CEa84Ygm.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "uuid";
import "@clerk/react";
import "@tanstack/react-router";
import "lodash-es";
import "@radix-ui/react-context-menu";
import "radix-ui";
import "./textarea-D5_jSc2n.js";
import "./checkbox-Cs4k79tJ.js";
import "zustand";
import "zustand/middleware";
import "zod";
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
import "class-variance-authority";
import "tailwind-merge";
import "react-hook-form";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
const BlockquoteComponent = ({ element, data }) => {
  const blockquoteElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(blockquoteElement);
  const commonProps = getCommonProps(blockquoteElement);
  const settings = blockquoteElement.settings ?? {};
  const cite = settings.cite;
  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable
  );
  return /* @__PURE__ */ jsx(
    "blockquote",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      cite: cite || void 0,
      ...commonProps,
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      suppressContentEditableWarning: true,
      dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(displayContent) }
    }
  );
};
const CheckboxComponent = ({ element }) => {
  const checkboxElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(checkboxElement);
  const settings = checkboxElement.settings ?? {};
  const name = settings.name;
  const defaultChecked = settings.defaultChecked ?? false;
  const required = settings.required ?? false;
  const disabled = settings.disabled ?? false;
  const value = settings.value ?? "";
  const label = settings.label || checkboxElement.content || "Checkbox label";
  const checkboxId = `checkbox-${element.id}`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ...eventsStyle(eventsActive)
      },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: checkboxId,
            type: "checkbox",
            name,
            defaultChecked,
            required,
            disabled: disabled && !eventsActive,
            value,
            style: {
              width: "16px",
              height: "16px",
              cursor: "pointer",
              accentColor: "var(--color-primary, #2563eb)",
              flexShrink: 0
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: checkboxId,
            style: {
              cursor: "pointer",
              fontSize: safeStyles.fontSize ?? "14px",
              fontWeight: safeStyles.fontWeight ?? "400",
              color: safeStyles.color ?? "var(--text-primary, #1e293b)",
              lineHeight: "1.4"
            },
            children: label
          }
        )
      ]
    }
  );
};
const CodeComponent = ({ element, data }) => {
  const codeElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(codeElement);
  const commonProps = getCommonProps(codeElement);
  const settings = codeElement.settings ?? {};
  const language = settings.language ?? "";
  const preformatted = settings.preformatted ?? true;
  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable
  );
  const codeInnerStyle = {
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    color: "inherit",
    background: "transparent",
    display: "block",
    whiteSpace: "pre",
    overflowX: "auto",
    tabSize: 2
  };
  if (preformatted) {
    return /* @__PURE__ */ jsxs(
      "pre",
      {
        ref: elementRef,
        "data-element-id": element.id,
        "data-element-type": element.type,
        ...commonProps,
        ...eventHandlers,
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          margin: 0,
          position: "relative",
          ...eventsStyle(eventsActive)
        },
        suppressContentEditableWarning: true,
        children: [
          language && /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                position: "absolute",
                top: "8px",
                right: "12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-muted, #94a3b8)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                pointerEvents: "none",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              },
              children: language
            }
          ),
          /* @__PURE__ */ jsx(
            "code",
            {
              "data-language": language || void 0,
              style: codeInnerStyle,
              dangerouslySetInnerHTML: {
                __html: DOMPurify.sanitize(displayContent)
              }
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "code",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      "data-language": language || void 0,
      ...commonProps,
      ...eventHandlers,
      style: {
        ...safeStyles,
        display: "inline",
        padding: "2px 6px",
        borderRadius: "4px",
        backgroundColor: safeStyles.backgroundColor ?? "var(--bg-code-inline, #f1f5f9)",
        color: safeStyles.color ?? "var(--text-code-inline, #e11d48)",
        fontSize: safeStyles.fontSize ?? "0.875em",
        fontFamily: safeStyles.fontFamily ?? "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
        ...eventsStyle(eventsActive)
      },
      suppressContentEditableWarning: true,
      dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(displayContent) }
    }
  );
};
const HeadingComponent = ({ element, data }) => {
  const headingElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(headingElement);
  const commonProps = getCommonProps(headingElement);
  const settings = headingElement.settings ?? { level: 2 };
  const level = settings.level ?? 2;
  const Tag = `h${level}`;
  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable
  );
  return React__default.createElement(Tag, {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...commonProps,
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive)
    },
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: {
      __html: DOMPurify.sanitize(displayContent)
    }
  });
};
const IconComponent = ({ element }) => {
  const iconElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(iconElement);
  const settings = iconElement.settings ?? {};
  const iconName = settings.iconName ?? "star";
  const size = settings.size ?? 24;
  const strokeWidth = settings.strokeWidth ?? 2;
  const color = settings.color ?? "currentColor";
  const fill = settings.fill ?? "none";
  const absoluteStrokeWidth = settings.absoluteStrokeWidth ?? false;
  const fallback = () => /* @__PURE__ */ jsx(Empty, { className: "w-full h-full min-h-12", children: /* @__PURE__ */ jsxs(EmptyHeader, { children: [
    /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Smile, {}) }),
    /* @__PURE__ */ jsx(EmptyTitle, { className: "text-xs", children: "Icon not found" }),
    /* @__PURE__ */ jsxs(EmptyDescription, { className: "text-xs", children: [
      "“",
      iconName,
      "” is not a valid Lucide icon name"
    ] })
  ] }) });
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(iconElement),
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...eventsStyle(eventsActive)
      },
      children: /* @__PURE__ */ jsx(
        DynamicIcon,
        {
          name: iconName,
          size,
          strokeWidth,
          color,
          fill,
          absoluteStrokeWidth,
          fallback
        }
      )
    }
  );
};
const IFrameComponent = ({ element }) => {
  const iframeElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(iframeElement);
  const settings = iframeElement.settings ?? {};
  const sandbox = settings.sandbox ?? "allow-scripts allow-same-origin";
  const allow = settings.allow;
  const loading = settings.loading ?? "lazy";
  const referrerPolicy = settings.referrerPolicy;
  const iframeWidth = settings.width ?? "100%";
  const iframeHeight = settings.height ?? 400;
  const rootProps = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(iframeElement),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive)
    }
  };
  if (iframeElement.src) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ...rootProps,
        className: "relative w-full h-full",
        style: {
          ...rootProps.style,
          position: "relative"
        },
        children: [
          /* @__PURE__ */ jsx(
            "iframe",
            {
              src: iframeElement.src,
              title: iframeElement.name || "Embedded content",
              sandbox,
              allow,
              loading,
              referrerPolicy,
              style: {
                width: typeof iframeWidth === "number" ? `${iframeWidth}px` : iframeWidth,
                height: typeof iframeHeight === "number" ? `${iframeHeight}px` : iframeHeight,
                border: "none"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute inset-0",
              style: {
                pointerEvents: eventsActive ? "none" : "auto",
                background: "transparent"
              }
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { ...rootProps, className: "w-full h-full", children: /* @__PURE__ */ jsx(Empty, { className: "w-full h-full", children: /* @__PURE__ */ jsxs(EmptyHeader, { children: [
    /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Globe, {}) }),
    /* @__PURE__ */ jsx(EmptyTitle, { children: "No URL set" }),
    /* @__PURE__ */ jsx(EmptyDescription, { className: "text-xs", children: "Set a source URL in the settings panel to embed external content" })
  ] }) }) });
};
const AudioComponent = ({ element }) => {
  const audioElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useMediaDrop({
    element,
    mediaType: "audio"
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(audioElement);
  const settings = audioElement.settings ?? {};
  const controls = settings.controls ?? true;
  const autoplay = settings.autoplay ?? false;
  const loop = settings.loop ?? false;
  const muted = settings.muted ?? false;
  const preload = settings.preload ?? "metadata";
  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };
  const wrapperProps = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(audioElement),
    ...eventHandlers,
    ...dragHandlers
  };
  if (audioElement.src) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ...wrapperProps,
        className: cn(
          "relative w-full h-full",
          isDragOver && "ring-2 ring-primary ring-offset-2"
        ),
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          ...eventsStyle(eventsActive)
        },
        children: [
          /* @__PURE__ */ jsx(
            "audio",
            {
              src: audioElement.src,
              controls,
              autoPlay: autoplay,
              loop,
              muted,
              preload,
              style: { width: "100%" }
            }
          ),
          isDragOver && /* @__PURE__ */ jsx(DropOverlay, { label: "Drop to replace audio" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ...wrapperProps,
      className: cn(
        "w-full h-full",
        isDragOver && "ring-2 ring-primary ring-offset-2"
      ),
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      children: [
        /* @__PURE__ */ jsx(Empty, { className: "w-full h-full", children: /* @__PURE__ */ jsxs(EmptyHeader, { children: [
          /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Volume2, {}) }),
          /* @__PURE__ */ jsx(EmptyTitle, { children: "No audio selected" }),
          /* @__PURE__ */ jsx(EmptyDescription, { className: "text-xs", children: "Add an audio source URL or drag an audio file here" })
        ] }) }),
        isDragOver && /* @__PURE__ */ jsx(DropOverlay, { label: "Drop to add audio" })
      ]
    }
  );
};
const VideoComponent = ({ element }) => {
  const videoElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useMediaDrop({
    element,
    mediaType: "video"
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(videoElement);
  const settings = videoElement.settings ?? {};
  const controls = settings.controls ?? true;
  const autoplay = settings.autoplay ?? false;
  const loop = settings.loop ?? false;
  const muted = settings.muted ?? false;
  const poster = settings.poster;
  const preload = settings.preload ?? "metadata";
  const playsInline = settings.playsInline ?? true;
  const objectFit = settings.objectFit ?? "contain";
  const dragHandlers = {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };
  const wrapperProps = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(videoElement),
    ...eventHandlers,
    ...dragHandlers
  };
  if (videoElement.src) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        ...wrapperProps,
        className: cn(
          "relative w-full h-full",
          isDragOver && "ring-2 ring-primary ring-offset-2"
        ),
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          ...eventsStyle(eventsActive)
        },
        children: [
          /* @__PURE__ */ jsx(
            "video",
            {
              src: videoElement.src,
              controls,
              autoPlay: autoplay,
              loop,
              muted,
              poster,
              preload,
              playsInline,
              style: {
                width: "100%",
                height: "100%",
                objectFit
              }
            }
          ),
          isDragOver && /* @__PURE__ */ jsx(DropOverlay, { label: "Drop to replace video" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ...wrapperProps,
      className: cn(
        "w-full h-full",
        isDragOver && "ring-2 ring-primary ring-offset-2"
      ),
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive)
      },
      children: [
        /* @__PURE__ */ jsx(Empty, { className: "w-full h-full", children: /* @__PURE__ */ jsxs(EmptyHeader, { children: [
          /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Video, {}) }),
          /* @__PURE__ */ jsx(EmptyTitle, { children: "No video selected" }),
          /* @__PURE__ */ jsx(EmptyDescription, { className: "text-xs", children: "Add a video source URL or drag a video here" })
        ] }) }),
        isDragOver && /* @__PURE__ */ jsx(DropOverlay, { label: "Drop to add video" })
      ]
    }
  );
};
const ProgressComponent = ({ element }) => {
  const progressElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const safeStyles = elementHelper.getSafeStyles(progressElement);
  const settings = progressElement.settings ?? {};
  const value = settings.value ?? 50;
  const max = settings.max ?? 100;
  const indeterminate = settings.indeterminate ?? false;
  const label = settings.label ?? "Progress";
  const percentage = indeterminate ? 0 : Math.min(value / max * 100, 100);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...eventHandlers,
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        ...eventsStyle(eventsActive)
      },
      children: [
        label && /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: "500",
              color: "var(--text-secondary, #64748b)"
            },
            children: [
              /* @__PURE__ */ jsx("span", { children: label }),
              !indeterminate && /* @__PURE__ */ jsxs("span", { children: [
                Math.round(percentage),
                "%"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            role: "progressbar",
            "aria-valuenow": indeterminate ? void 0 : value,
            "aria-valuemin": 0,
            "aria-valuemax": max,
            "aria-label": label,
            style: {
              ...safeStyles,
              width: "100%",
              position: "relative",
              overflow: "hidden"
            },
            children: /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  height: "100%",
                  width: indeterminate ? "40%" : `${percentage}%`,
                  backgroundColor: "var(--color-primary, #2563eb)",
                  borderRadius: "inherit",
                  transition: indeterminate ? "none" : "width 0.3s ease-in-out",
                  ...indeterminate ? {
                    animation: "progress-indeterminate 1.5s ease-in-out infinite"
                  } : {}
                }
              }
            )
          }
        ),
        indeterminate && /* @__PURE__ */ jsx("style", { children: `
          @keyframes progress-indeterminate {
            0%   { transform: translateX(-100%); }
            50%  { transform: translateX(150%); }
            100% { transform: translateX(-100%); }
          }
        ` })
      ]
    }
  );
};
const RadioComponent = ({ element }) => {
  const radioElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(radioElement);
  const settings = radioElement.settings ?? {};
  const name = settings.name;
  const defaultChecked = settings.defaultChecked ?? false;
  const required = settings.required ?? false;
  const disabled = settings.disabled ?? false;
  const value = settings.value ?? "";
  const label = settings.label || radioElement.content || "Radio label";
  const radioId = `radio-${element.id}`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ...eventsStyle(eventsActive)
      },
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: radioId,
            type: "radio",
            name,
            defaultChecked,
            required,
            disabled: disabled && !eventsActive,
            value,
            style: {
              width: "16px",
              height: "16px",
              cursor: "pointer",
              accentColor: "var(--color-primary, #2563eb)",
              flexShrink: 0
            }
          }
        ),
        /* @__PURE__ */ jsx(
          "label",
          {
            htmlFor: radioId,
            style: {
              cursor: "pointer",
              fontSize: safeStyles.fontSize ?? "14px",
              fontWeight: safeStyles.fontWeight ?? "400",
              color: safeStyles.color ?? "var(--text-primary, #1e293b)",
              lineHeight: "1.4"
            },
            children: label
          }
        )
      ]
    }
  );
};
const ELEMENT_TYPE_TO_TAG = {
  Nav: "nav",
  Header: "header",
  Footer: "footer",
  Article: "article",
  Aside: "aside"
};
const SemanticContainerComponent = ({
  element,
  data
}) => {
  const semanticElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(semanticElement);
  const tag = ELEMENT_TYPE_TO_TAG[element.type] ?? "div";
  const props = {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(semanticElement),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      position: "relative",
      ...eventsStyle(eventsActive)
    }
  };
  return React__default.createElement(
    tag,
    props,
    /* @__PURE__ */ jsx(ElementLoader, { elements: semanticElement.elements, data })
  );
};
const SeparatorComponent = ({ element }) => {
  const separatorElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(separatorElement);
  return /* @__PURE__ */ jsx(
    "hr",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(separatorElement),
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        ...eventsStyle(eventsActive)
      }
    }
  );
};
const TableComponent = ({ element, data }) => {
  const tableElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(tableElement);
  const settings = tableElement.settings ?? {};
  const caption = settings.caption;
  const bordered = settings.bordered ?? true;
  const striped = settings.striped ?? false;
  const hoverable = settings.hoverable ?? true;
  const compact = settings.compact ?? false;
  const columns = settings.columns ?? [];
  const cellPadding = compact ? "6px 10px" : "10px 16px";
  const headerCellStyle = (col) => ({
    padding: cellPadding,
    textAlign: col.align ?? "left",
    fontWeight: 600,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--text-secondary, #64748b)",
    backgroundColor: "var(--bg-table-header, #f8fafc)",
    borderBottom: bordered ? "2px solid rgba(15,23,42,0.08)" : "none",
    whiteSpace: "nowrap",
    ...col.width ? { width: typeof col.width === "number" ? `${col.width}px` : col.width } : {}
  });
  const hasChildren = tableElement.elements && tableElement.elements.length > 0;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      ...getCommonProps(tableElement),
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "auto",
        ...eventsStyle(eventsActive)
      },
      children: [
        /* @__PURE__ */ jsxs(
          "table",
          {
            style: {
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "auto"
            },
            children: [
              caption && /* @__PURE__ */ jsx(
                "caption",
                {
                  style: {
                    padding: compact ? "8px 10px" : "12px 16px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-secondary, #64748b)",
                    textAlign: "left",
                    captionSide: "top"
                  },
                  children: caption
                }
              ),
              columns.length > 0 && /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((col) => /* @__PURE__ */ jsx("th", { style: headerCellStyle(col), children: col.header }, col.id)) }) }),
              /* @__PURE__ */ jsx("tbody", { children: hasChildren ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length || 1, style: { padding: 0 }, children: /* @__PURE__ */ jsx(ElementLoader, { elements: tableElement.elements, data }) }) }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                "td",
                {
                  colSpan: columns.length || 1,
                  style: {
                    padding: "32px 16px",
                    textAlign: "center",
                    color: "var(--text-muted, #94a3b8)",
                    fontSize: "13px"
                  },
                  children: /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px"
                      },
                      children: [
                        /* @__PURE__ */ jsxs(
                          "svg",
                          {
                            xmlns: "http://www.w3.org/2000/svg",
                            width: "32",
                            height: "32",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            strokeWidth: "1.5",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            style: { opacity: 0.5 },
                            children: [
                              /* @__PURE__ */ jsx("path", { d: "M12 3v18" }),
                              /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
                              /* @__PURE__ */ jsx("path", { d: "M3 9h18" }),
                              /* @__PURE__ */ jsx("path", { d: "M3 15h18" })
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { children: "Drop elements here to populate the table" })
                      ]
                    }
                  )
                }
              ) }) })
            ]
          }
        ),
        (striped || hoverable) && /* @__PURE__ */ jsx("style", { children: `
          [data-element-id="${element.id}"] tbody tr:nth-child(even) {
            ${striped ? "background-color: var(--bg-table-stripe, rgba(248,250,252,0.5));" : ""}
          }
          ${hoverable ? `[data-element-id="${element.id}"] tbody tr:hover {
                   background-color: var(--bg-table-hover, rgba(241,245,249,0.8));
                   transition: background-color 0.15s ease;
                 }` : ""}
        ` })
      ]
    }
  );
};
const TextareaComponent = ({ element }) => {
  const textareaElement = element;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events
  });
  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(textareaElement);
  const commonProps = getCommonProps(textareaElement);
  const settings = textareaElement.settings ?? {};
  const placeholder = settings.placeholder ?? "Enter text...";
  const rows = settings.rows ?? 4;
  const cols = settings.cols;
  const maxLength = settings.maxLength;
  const minLength = settings.minLength;
  const required = settings.required ?? false;
  const readOnly = settings.readOnly ?? false;
  const disabled = settings.disabled ?? false;
  const wrap = settings.wrap;
  const autoComplete = settings.autoComplete;
  const spellCheck = settings.spellCheck;
  const resize = settings.resize ?? "vertical";
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      ref: elementRef,
      "data-element-id": element.id,
      "data-element-type": element.type,
      placeholder,
      rows,
      cols,
      maxLength,
      minLength,
      required,
      readOnly,
      disabled: disabled && !eventsActive,
      wrap,
      autoComplete,
      spellCheck,
      defaultValue: settings.defaultValue ?? "",
      ...commonProps,
      ...eventHandlers,
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        resize,
        ...eventsStyle(eventsActive)
      }
    }
  );
};
export {
  AudioComponent,
  BaseComponent,
  BlockquoteComponent,
  ButtonComponent,
  CMSContentGridComponent,
  CMSContentItemComponent,
  CMSContentListComponent,
  CarouselComponent,
  CheckboxComponent,
  CodeComponent,
  FormComponent,
  FrameComponent,
  HeadingComponent,
  IFrameComponent,
  IconComponent,
  ImageComponent,
  InputComponent,
  ListComponent,
  ProgressComponent,
  RadioComponent,
  SectionComponent,
  SelectComponent,
  SemanticContainerComponent,
  SeparatorComponent,
  TableComponent,
  TextareaComponent,
  VideoComponent
};
