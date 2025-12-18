"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { viewportSizes } from "@/constants/viewports";
import { Viewport } from "@/hooks";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/globalstore/projectstore";
import ElementLoading from "@/components/editor/skeleton/ElementLoading";

type PreviewContainerProps = {
  currentView: Viewport;
  children: React.ReactElement;
  isLoading?: boolean;
};

/**
 * PreviewContainer
 *
 * - Always renders an iframe for all viewports so the preview is isolated from
 *   the editor DOM. Children are portaled into the iframe's `#react-iframe-root`.
 * - Copies stylesheet <link> and <style> tags from the parent document head
 *   and injects project custom styles into the iframe head so Tailwind / CSS is
 *   available inside the iframe.
 * - Shows the same ElementLoading skeleton used by the EditorCanvas while
 *   content is loading or while the iframe hasn't mounted yet.
 */
const PreviewContainer: React.FC<PreviewContainerProps> = ({
  currentView,
  children,
  isLoading = false,
}) => {
  const containerStyle: React.CSSProperties = {
    width: viewportSizes[currentView].width,
    height: viewportSizes[currentView].height,
    minHeight: viewportSizes[currentView].height,
  };

  const containerClasses = `transition-all duration-300 bg-card relative ${
    currentView === "desktop"
      ? "h-full w-full"
      : "rounded-lg border-2 border-border shadow-lg"
  }`;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [srcDoc, setSrcDoc] = useState<string>("");

  const { project } = useProjectStore();

  const projectHead = useMemo(() => {
    const cs = (project?.header?.cssStyles ?? "").trim();
    if (!cs) return "";
    const looksLikeHtml =
      cs.startsWith("<") || /<link\b|<style\b|<meta\b|<script\b/i.test(cs);
    return looksLikeHtml ? cs : `<style>${cs}</style>`;
  }, [project?.header?.cssStyles]);

  const loadProjectHead = useCallback(() => {
    if (typeof document === "undefined") return;

    try {
      const headNodes = Array.from(
        document.head.querySelectorAll("link[rel='stylesheet'], style"),
      );

      const headHtml = headNodes
        .map((node) => {
          try {
            return node.outerHTML;
          } catch {
            const nodeName = node.nodeName.toLowerCase();
            if (nodeName === "style") {
              return `<style>${(node as HTMLStyleElement).textContent || ""}</style>`;
            }
            if (nodeName === "link") {
              const href = (node as HTMLLinkElement).href;
              return href ? `<link rel="stylesheet" href="${href}">` : "";
            }
            return "";
          }
        })
        .join("\n");

      const viewportMeta = document.head.querySelector('meta[name="viewport"]');
      const viewportHtml = viewportMeta ? viewportMeta.outerHTML : "";

      const doc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    ${viewportHtml}
    ${headHtml}
    ${projectHead || ""}
    <style>html,body,#react-iframe-root{height:100%;margin:0;padding:0;background:transparent;overflow:hidden}</style>
  </head>
  <body>
    <div id="react-iframe-root" style="height:100%;width:100%"></div>
  </body>
</html>`;

      setSrcDoc(doc);
    } catch {
      setSrcDoc(
        `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>${projectHead || ""}<style>html,body,#react-iframe-root{height:100%;margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body><div id="react-iframe-root" style="height:100%;width:100%"></div></body></html>`,
      );
    }
  }, [projectHead]);

  useEffect(() => {
    loadProjectHead();
  }, [currentView, projectHead, loadProjectHead]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      setMountNode(null);
      return;
    }

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) {
          setMountNode(null);
          return;
        }
        const mount =
          (doc.getElementById("react-iframe-root") as HTMLElement | null) ||
          doc.body;
        setMountNode(mount);
      } catch {
        setMountNode(null);
      }
    };

    iframe.addEventListener("load", handleLoad);

    // If iframe already ready, attempt to handle immediately.
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
      setMountNode(null);
    };
  }, [srcDoc, currentView]);

  // When projectHead (injected CSS/links) changes we must ensure the iframe
  // head is updated in-place so the preview reflects the new styles without
  // waiting for a full iframe reload. We add/remove a marker element ID and
  // append the new nodes directly into the iframe head.
  //
  // Special handling: If the injected content contains a <link rel="stylesheet"
  // href="blob:..."> we can't rely on simply copying the <link> into the iframe
  // in some environments. Instead, fetch the blob URL content and inject it as
  // a <style> tag so the styles take effect reliably.
  useEffect(() => {
    const iframe = iframeRef.current;
    // Only attempt to update after the mount node (iframe content) exists.
    if (!iframe || !mountNode) return;

    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const markerId = "project-custom-styles";

      // Remove any previous injected nodes
      const prev = doc.getElementById(markerId);
      if (prev) prev.remove();

      // If there's nothing to inject, we're done.
      if (!projectHead) return;

      // Create a temporary container to parse the HTML snippet (which may
      // contain <style> and/or <link> tags) and examine them.
      const wrapper = doc.createElement("div");
      wrapper.id = markerId;
      wrapper.innerHTML = projectHead;

      // Helper to append a <style> with given CSS text into the iframe head.
      const appendStyle = (cssText: string) => {
        try {
          const style = doc.createElement("style");
          style.setAttribute("data-wbv2-custom", "1");
          style.appendChild(doc.createTextNode(cssText));
          doc.head.appendChild(style);
        } catch {
          // ignore failures to append style
        }
      };

      // Collect any async fetch promises (for blob: links)
      const asyncFetches: Promise<void>[] = [];

      const nodes = Array.from(wrapper.childNodes);
      nodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();

          if (
            tag === "link" &&
            (el.getAttribute("rel") || "").toLowerCase() === "stylesheet"
          ) {
            const href = el.getAttribute("href") || "";

            // If it's a blob: URL, fetch its contents and inject as <style>.
            if (href.startsWith("blob:")) {
              const p = fetch(href)
                .then((r) => {
                  if (!r.ok) throw new Error("failed to fetch blob stylesheet");
                  return r.text();
                })
                .then((css) => {
                  appendStyle(css);
                })
                .catch(() => {
                  // silently ignore fetch failures
                });
              asyncFetches.push(p);
              return;
            }

            try {
              const imported = doc.importNode(node, true) as HTMLElement;
              if (imported && imported.setAttribute)
                imported.setAttribute("data-wbv2-custom", "1");
              doc.head.appendChild(imported);
            } catch {}
            return;
          }

          // If it's a style node, import it
          if (tag === "style") {
            try {
              const imported = doc.importNode(node, true) as HTMLElement;
              if (imported && imported.setAttribute)
                imported.setAttribute("data-wbv2-custom", "1");
              doc.head.appendChild(imported);
            } catch {
              // ignore
            }
            return;
          }
        }

        // Fallback: try to import any other node types (meta, etc.)
        try {
          const imported = doc.importNode(node, true) as HTMLElement;
          if (imported && imported.setAttribute)
            imported.setAttribute("data-wbv2-custom", "1");
          doc.head.appendChild(imported);
        } catch {
          // ignore
        }
      });

      // Wait for blob fetches to complete (fire-and-forget is also ok, but waiting
      // helps ensure styles are applied quickly). Errors are ignored.
      if (asyncFetches.length > 0) {
        Promise.all(asyncFetches).catch(() => {});
      }
    } catch {
      // Ignore cross-origin or other unexpected errors silently.
    }
  }, [projectHead, mountNode]);

  const content = isLoading ? (
    <ElementLoading count={6} variant="mixed" />
  ) : (
    React.cloneElement(children, { iframeRef } as any)
  );
  const iframePortal = mountNode ? createPortal(content, mountNode) : null;

  return (
    <div className="overflow-hidden h-full flex items-center justify-center">
      <div className={cn(containerClasses)} style={containerStyle}>
        <iframe
          ref={iframeRef}
          key={`${currentView}`}
          id="preview-iframe"
          title={`preview-${currentView}`}
          srcDoc={
            srcDoc ||
            `<!doctype html><html><head>${projectHead || ""}</head><body><div id="react-iframe-root"></div></body></html>`
          }
          aria-label="editor-preview-iframe"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />
        {!mountNode && isLoading && (
          <ElementLoading count={6} variant="mixed" />
        )}
        {iframePortal}
      </div>
    </div>
  );
};

export default PreviewContainer;
