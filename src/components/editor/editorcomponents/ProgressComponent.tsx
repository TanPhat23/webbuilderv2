"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  ProgressElement,
  ProgressSettings,
} from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const ProgressComponent = ({ element }: EditorComponentProps) => {
  const progressElement = element as ProgressElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(progressElement);

  const settings = (progressElement.settings ?? {}) as ProgressSettings;
  const value = settings.value ?? 50;
  const max = settings.max ?? 100;
  const indeterminate = settings.indeterminate ?? false;
  const label = settings.label ?? "Progress";

  const percentage = indeterminate ? 0 : Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...eventHandlers}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    >
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            fontWeight: "500",
            color: "var(--text-secondary, #64748b)",
          }}
        >
          <span>{label}</span>
          {!indeterminate && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        style={{
          ...safeStyles,
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: indeterminate ? "40%" : `${percentage}%`,
            backgroundColor: "var(--color-primary, #2563eb)",
            borderRadius: "inherit",
            transition: indeterminate ? "none" : "width 0.3s ease-in-out",
            ...(indeterminate
              ? {
                  animation: "progress-indeterminate 1.5s ease-in-out infinite",
                }
              : {}),
          }}
        />
      </div>
      {indeterminate && (
        <style>{`
          @keyframes progress-indeterminate {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(150%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default ProgressComponent;
