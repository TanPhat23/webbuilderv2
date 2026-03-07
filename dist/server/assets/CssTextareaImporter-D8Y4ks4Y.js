import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { a8 as useProjectStore, F as Dialog, ab as DialogTrigger, B as Button, G as DialogContent, H as DialogHeader, J as DialogTitle, K as DialogDescription, L as Label, h as cn, M as DialogFooter, aW as DialogClose } from "./prisma-BUnO9f9X.js";
import { T as Textarea } from "./textarea-D5_jSc2n.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import "./project.service-Bci2lGYe.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
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
import "@tanstack/react-router";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "lucide-react";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function CssTextareaImporter({
  maxInlineSize = 200 * 1024
}) {
  const { project, updateProject } = useProjectStore();
  const [mode, setMode] = useState("inline");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const blobUrlRef = useRef(null);
  const fileInputRef = useRef(null);
  const [css, setCss] = useState(
    () => project?.header?.cssStyles ?? ""
  );
  useEffect(() => {
    setCss(project?.header?.cssStyles ?? "");
  }, [project?.header?.cssStyles]);
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        try {
          URL.revokeObjectURL(blobUrlRef.current);
        } catch {
        }
        blobUrlRef.current = null;
      }
    };
  }, []);
  const validateCss = (text) => {
    if (!text) return "CSS is empty";
    if (text.length > maxInlineSize && mode === "inline") {
      return `CSS too large for inline mode (${Math.round(text.length / 1024)} KB). Use blob mode instead.`;
    }
    const lowered = text.toLowerCase();
    if (lowered.includes("<script") || lowered.includes("<\/script")) {
      return "CSS contains forbidden <script> tags.";
    }
    if (lowered.includes("<!doctype") || lowered.includes("<html") || lowered.includes("<body")) {
      return "Please paste only CSS content (no full HTML).";
    }
    return null;
  };
  const handleInject = async () => {
    setError(null);
    setInfo(null);
    const validation = validateCss(css);
    if (validation) {
      setError(validation);
      return;
    }
    if (!updateProject) {
      setError("Update function unavailable.");
      return;
    }
    if (mode === "inline") {
      try {
        console.debug(
          "CssTextareaImporter: about to call updateProject (inline)",
          {
            projectId: project?.id,
            updates: { header: { cssStyles: css } }
          }
        );
        const res = await updateProject(
          { header: { cssStyles: css } },
          project?.id
        );
        console.debug("CssTextareaImporter: updateProject (inline) returned", {
          res
        });
        if (res) {
          if (res.header?.cssStyles !== void 0) {
            setCss(res.header.cssStyles ?? "");
          } else {
          }
        }
        setInfo(
          "Injected CSS inline into preview (stored in project.header.cssStyles)."
        );
        if (blobUrlRef.current) {
          try {
            URL.revokeObjectURL(blobUrlRef.current);
          } catch {
          }
          blobUrlRef.current = null;
        }
      } catch (err) {
        console.error(
          "CssTextareaImporter: updateProject (inline) failed",
          err
        );
        setError(String(err ?? "Failed to update project with inline CSS."));
      }
    } else {
      try {
        const blob = new Blob([css], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        if (blobUrlRef.current) {
          try {
            URL.revokeObjectURL(blobUrlRef.current);
          } catch {
          }
        }
        blobUrlRef.current = url;
        const linkHtml = `<link rel="stylesheet" href="${url}">`;
        const res = await updateProject(
          { header: { cssStyles: linkHtml } },
          project?.id
        );
        if (res) {
          if (res.header?.cssStyles !== void 0) {
            setCss(res.header.cssStyles ?? linkHtml);
          } else {
            if (!css) setCss(linkHtml);
          }
        }
        setInfo(
          "Created blob URL and injected as <link> into preview (stored in project.header.cssStyles)."
        );
      } catch (e) {
        setError("Failed to create blob URL for CSS.");
      }
    }
  };
  const handleClear = async () => {
    setError(null);
    setInfo(null);
    try {
      const res = updateProject ? await updateProject({ header: { cssStyles: "" } }, project?.id) : null;
      console.debug("CssTextareaImporter: clear header.cssStyles result", {
        res
      });
      setCss(res?.header?.cssStyles ?? "");
      setInfo("Cleared injected CSS.");
    } catch (err) {
      console.error(
        "CssTextareaImporter: failed to clear header.cssStyles",
        err
      );
      setError(String(err ?? "Failed to clear project header CSS."));
    }
    if (blobUrlRef.current) {
      try {
        URL.revokeObjectURL(blobUrlRef.current);
      } catch {
      }
      blobUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleFileChange = async (f) => {
    if (!f) return;
    if (!f.type.includes("css") && !f.name.endsWith(".css")) {
      setError("Please select a CSS file (.css)");
      return;
    }
    try {
      const text = await f.text();
      setCss(text);
      setError(null);
      setInfo(`Read ${Math.round(text.length / 1024)} KB from file.`);
    } catch (e) {
      setError("Failed to read file.");
    }
  };
  return /* @__PURE__ */ jsxs(Dialog, { children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "Import CSS" }) }),
    /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Import CSS" }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "Paste compiled Tailwind CSS (the build output of",
          " ",
          /* @__PURE__ */ jsx("code", { children: "globals.css" }),
          ") or upload a .css file. You can go to TweakCN from link provided to build custom Tailwind CSS files."
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://tweakcn.com",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "hover:text-accent-foreground",
            children: "https://tweakcn.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Mode" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              onValueChange: (v) => setMode(v),
              value: mode,
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { size: "sm", className: "w-40 text-xs", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "inline", children: "Inline <style>" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "blob", children: "Blob URL <link>" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "CSS" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              value: css,
              onChange: (e) => setCss(e.target.value),
              placeholder: "Paste your compiled CSS here (Tailwind output, component styles, etc.)",
              className: "min-h-[240px] max-h-[300px] text-xs font-mono bg-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              id: "css-file",
              type: "file",
              accept: ".css,text/css",
              className: "hidden",
              onChange: (e) => handleFileChange(e.target.files?.[0] ?? null)
            }
          ),
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsx("label", { htmlFor: "css-file", className: "cursor-pointer", children: "Upload .css" }) }),
          /* @__PURE__ */ jsx(Button, { onClick: handleInject, size: "sm", children: "Inject" }),
          /* @__PURE__ */ jsx(Button, { onClick: handleClear, variant: "ghost", size: "sm", children: "Clear" }),
          /* @__PURE__ */ jsxs("div", { className: "ml-auto text-xs text-muted-foreground", children: [
            css.length,
            " bytes"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs", children: error ? /* @__PURE__ */ jsx(
          "div",
          {
            className: cn("text-sm text-destructive", "mt-1"),
            role: "alert",
            children: error
          }
        ) : info ? /* @__PURE__ */ jsx(
          "div",
          {
            className: cn("text-sm text-muted-foreground", "mt-1"),
            role: "status",
            children: info
          }
        ) : /* @__PURE__ */ jsx("div", { className: "text-muted-foreground mt-1 text-xs", children: "Tip: paste your compiled Tailwind CSS (from globals.css build output) here." }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("details", { children: [
          /* @__PURE__ */ jsx("summary", { className: "cursor-pointer", children: "Advanced: preview generated injection HTML" }),
          /* @__PURE__ */ jsx("pre", { className: "mt-2 p-2 bg-black/10 rounded text-xs overflow-auto", children: mode === "inline" ? `<style>${css.slice(0, 1e4)}${css.length > 1e4 ? "\n...truncated..." : ""}</style>` : blobUrlRef.current ? `<link rel="stylesheet" href="${blobUrlRef.current}">` : `<link rel="stylesheet" href="blob:...">` })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "mt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 w-full", children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "Close" }) }),
        /* @__PURE__ */ jsx("div", { className: "w-full" })
      ] }) })
    ] })
  ] });
}
export {
  CssTextareaImporter as default
};
