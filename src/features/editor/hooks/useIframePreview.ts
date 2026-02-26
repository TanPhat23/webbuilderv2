"use client";

import { useState, useEffect, useMemo } from "react";
import type React from "react";
import type { Viewport } from "./useEditor";

export function useProjectHead(cssStyles: string | undefined): string {
  return useMemo(() => {
    const cs = (cssStyles ?? "").trim();
    if (!cs) return "";
    const looksLikeHtml =
      cs.startsWith("<") || /<link\b|<style\b|<meta\b|<script\b/i.test(cs);
    return looksLikeHtml ? cs : `<style>${cs}</style>`;
  }, [cssStyles]);
}

export function useIframeSrcDoc(
  projectHead: string,
  currentView: Viewport,
): string {
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") return;

    const fallback = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>${projectHead}<style>html,body,#react-iframe-root{height:100%;margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body><div id="react-iframe-root" style="height:100%;width:100%"></div></body></html>`;

    try {
      const headNodes = Array.from(
        document.head.querySelectorAll("link[rel='stylesheet'], style"),
      );

      const headHtml = headNodes
        .map((node) => {
          try {
            return node.outerHTML;
          } catch {
            const name = node.nodeName.toLowerCase();
            if (name === "style")
              return `<style>${(node as HTMLStyleElement).textContent ?? ""}</style>`;
            if (name === "link") {
              const href = (node as HTMLLinkElement).href;
              return href ? `<link rel="stylesheet" href="${href}">` : "";
            }
            return "";
          }
        })
        .join("\n");

      const viewportHtml =
        document.head.querySelector('meta[name="viewport"]')?.outerHTML ?? "";

      setSrcDoc(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    ${viewportHtml}
    ${headHtml}
    ${projectHead}
    <style>html,body,#react-iframe-root{height:100%;margin:0;padding:0;background:transparent;overflow:hidden}</style>
  </head>
  <body>
    <div id="react-iframe-root" style="height:100%;width:100%"></div>
  </body>
</html>`);
    } catch {
      setSrcDoc(fallback);
    }
  }, [projectHead, currentView]);

  return srcDoc;
}

export function useIframeMountNode(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  srcDoc: string,
  currentView: Viewport,
): HTMLElement | null {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

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
        setMountNode(
          (doc.getElementById("react-iframe-root") as HTMLElement | null) ??
            doc.body,
        );
      } catch {
        setMountNode(null);
      }
    };

    iframe.addEventListener("load", handleLoad);
    if (iframe.contentDocument?.readyState === "complete") handleLoad();

    return () => {
      iframe.removeEventListener("load", handleLoad);
      setMountNode(null);
    };
  }, [srcDoc, currentView, iframeRef]);

  return mountNode;
}

export function useIframeStyleInjection(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  projectHead: string,
  mountNode: HTMLElement | null,
): void {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !mountNode) return;

    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const MARKER_ID = "project-custom-styles";
      doc.getElementById(MARKER_ID)?.remove();

      if (!projectHead) return;

      const wrapper = doc.createElement("div");
      wrapper.id = MARKER_ID;
      wrapper.innerHTML = projectHead;

      const appendStyle = (cssText: string) => {
        try {
          const style = doc.createElement("style");
          style.setAttribute("data-wbv2-custom", "1");
          style.appendChild(doc.createTextNode(cssText));
          doc.head.appendChild(style);
        } catch {}
      };

      const importNode = (node: Node) => {
        try {
          const imported = doc.importNode(node, true) as HTMLElement;
          imported?.setAttribute?.("data-wbv2-custom", "1");
          doc.head.appendChild(imported);
        } catch {}
      };

      const asyncFetches: Promise<void>[] = [];

      Array.from(wrapper.childNodes).forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          importNode(node);
          return;
        }

        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (
          tag === "link" &&
          el.getAttribute("rel")?.toLowerCase() === "stylesheet"
        ) {
          const href = el.getAttribute("href") ?? "";
          if (href.startsWith("blob:")) {
            asyncFetches.push(
              fetch(href)
                .then((r) => {
                  if (!r.ok) throw new Error("blob fetch failed");
                  return r.text();
                })
                .then(appendStyle)
                .catch(() => {}),
            );
            return;
          }
        }

        importNode(node);
      });

      if (asyncFetches.length > 0) Promise.all(asyncFetches).catch(() => {});
    } catch {}
  }, [projectHead, mountNode, iframeRef]);
}
