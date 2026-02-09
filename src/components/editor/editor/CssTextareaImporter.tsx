"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/globalstore/project-store";
import Link from "next/link";

type Props = {
  maxInlineSize?: number;
};

export default function CssTextareaImporter({
  maxInlineSize = 200 * 1024,
}: Props) {
  const { project, updateProject } = useProjectStore();
  const [mode, setMode] = useState<"inline" | "blob">("inline");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [css, setCss] = useState<string>(
    () => project?.header?.cssStyles ?? "",
  );

  useEffect(() => {
    setCss(project?.header?.cssStyles ?? "");
  }, [project?.header?.cssStyles]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        try {
          URL.revokeObjectURL(blobUrlRef.current);
        } catch {}
        blobUrlRef.current = null;
      }
    };
  }, []);

  const validateCss = (text: string): string | null => {
    if (!text) return "CSS is empty";
    if (text.length > maxInlineSize && mode === "inline") {
      return `CSS too large for inline mode (${Math.round(text.length / 1024)} KB). Use blob mode instead.`;
    }
    const lowered = text.toLowerCase();
    if (lowered.includes("<script") || lowered.includes("</script")) {
      return "CSS contains forbidden <script> tags.";
    }
    if (
      lowered.includes("<!doctype") ||
      lowered.includes("<html") ||
      lowered.includes("<body")
    ) {
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
            updates: { header: { cssStyles: css } },
          },
        );
        const res = await updateProject(
          { header: { cssStyles: css } },
          project?.id,
        );
        console.debug("CssTextareaImporter: updateProject (inline) returned", {
          res,
        });

        if (res) {
          if (res.header?.cssStyles !== undefined) {
            setCss(res.header.cssStyles ?? "");
          } else {
          }
        }
        setInfo(
          "Injected CSS inline into preview (stored in project.header.cssStyles).",
        );
        if (blobUrlRef.current) {
          try {
            URL.revokeObjectURL(blobUrlRef.current);
          } catch {
            // ignore
          }
          blobUrlRef.current = null;
        }
      } catch (err) {
        console.error(
          "CssTextareaImporter: updateProject (inline) failed",
          err,
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
          } catch {}
        }
        blobUrlRef.current = url;

        const linkHtml = `<link rel="stylesheet" href="${url}">`;

        const res = await updateProject(
          { header: { cssStyles: linkHtml } },
          project?.id,
        );
        if (res) {
          if (res.header?.cssStyles !== undefined) {
            setCss(res.header.cssStyles ?? linkHtml);
          } else {
            if (!css) setCss(linkHtml);
          }
        }
        setInfo(
          "Created blob URL and injected as <link> into preview (stored in project.header.cssStyles).",
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
      const res = updateProject
        ? await updateProject({ header: { cssStyles: "" } }, project?.id)
        : null;
      console.debug("CssTextareaImporter: clear header.cssStyles result", {
        res,
      });
      setCss(res?.header?.cssStyles ?? "");
      setInfo("Cleared injected CSS.");
    } catch (err) {
      console.error(
        "CssTextareaImporter: failed to clear header.cssStyles",
        err,
      );
      setError(String(err ?? "Failed to clear project header CSS."));
    }

    if (blobUrlRef.current) {
      try {
        URL.revokeObjectURL(blobUrlRef.current);
      } catch {}
      blobUrlRef.current = null;
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (f?: File | null) => {
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Import CSS
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import CSS</DialogTitle>
          <DialogDescription>
            Paste compiled Tailwind CSS (the build output of{" "}
            <code>globals.css</code>) or upload a .css file. You can go to
            TweakCN from link provided to build custom Tailwind CSS files.
          </DialogDescription>
          <Link
            href={"https://tweakcn.com"}
            className="hover:text-accent-foreground"
          >
            https://tweakcn.com
          </Link>
        </DialogHeader>

        <div className="mt-2">
          <div className="flex items-center gap-3 mb-2">
            <Label className="text-xs">Mode</Label>
            <Select
              onValueChange={(v) => setMode(v as "inline" | "blob")}
              value={mode}
            >
              <SelectTrigger size="sm" className="w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline">Inline &lt;style&gt;</SelectItem>
                <SelectItem value="blob">Blob URL &lt;link&gt;</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label className="text-xs">CSS</Label>
            <Textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder="Paste your compiled CSS here (Tailwind output, component styles, etc.)"
              className="min-h-[240px] max-h-[300px] text-xs font-mono bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id="css-file"
              type="file"
              accept=".css,text/css"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <Button asChild variant="outline" size="sm">
              <label htmlFor="css-file" className="cursor-pointer">
                Upload .css
              </label>
            </Button>

            <Button onClick={handleInject} size="sm">
              Inject
            </Button>

            <Button onClick={handleClear} variant="ghost" size="sm">
              Clear
            </Button>

            <div className="ml-auto text-xs text-muted-foreground">
              {css.length} bytes
            </div>
          </div>

          <div className="mt-3 text-xs">
            {error ? (
              <div
                className={cn("text-sm text-destructive", "mt-1")}
                role="alert"
              >
                {error}
              </div>
            ) : info ? (
              <div
                className={cn("text-sm text-muted-foreground", "mt-1")}
                role="status"
              >
                {info}
              </div>
            ) : (
              <div className="text-muted-foreground mt-1 text-xs">
                Tip: paste your compiled Tailwind CSS (from globals.css build
                output) here.
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <details>
              <summary className="cursor-pointer">
                Advanced: preview generated injection HTML
              </summary>
              <pre className="mt-2 p-2 bg-black/10 rounded text-xs overflow-auto">
                {mode === "inline"
                  ? `<style>${css.slice(0, 10000)}${css.length > 10000 ? "\n...truncated..." : ""}</style>`
                  : blobUrlRef.current
                    ? `<link rel="stylesheet" href="${blobUrlRef.current}">`
                    : `<link rel="stylesheet" href="blob:...">`}
              </pre>
            </details>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <div className="flex gap-2 w-full">
            <DialogClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DialogClose>

            <div className="w-full" />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
