import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/utils/errors/api-error";
import {
  useCurrentProject,
  useUpdateProject,
} from "@/features/projects/hooks/useProjects";
import {
  cssByteLength,
  formatCssPreview,
  isCssUploadFile,
  validateCssImport,
} from "../lib/cssImport";

export function useCssImporter(maxInlineSize: number): {
  css: string;
  byteCount: number;
  error: string | null;
  info: string | null;
  previewHtml: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setCss: (value: string) => void;
  handleInject: () => Promise<void>;
  handleClear: () => Promise<void>;
  handleFileChange: (file?: File | null) => Promise<void>;
} {
  const { data: project } = useCurrentProject();
  const mutation = useUpdateProject();

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [css, setCssState] = useState<string>(
    () => project?.header?.cssStyles ?? "",
  );
  const dirtyRef = useRef(false);
  const projectIdRef = useRef<string | undefined>(project?.id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (projectIdRef.current !== project?.id) {
      projectIdRef.current = project?.id;
      dirtyRef.current = false;
      setCssState(project?.header?.cssStyles ?? "");
      return;
    }
    if (!dirtyRef.current) {
      setCssState(project?.header?.cssStyles ?? "");
    }
  }, [project?.id, project?.header?.cssStyles]);

  const setCss = useCallback((value: string) => {
    dirtyRef.current = true;
    setCssState(value);
  }, []);

  const persistHeaderCss = useCallback(
    async (cssStyles: string) => {
      if (!project?.id) throw new Error("No project id available for update");
      return await mutation.mutateAsync({
        projectId: project.id,
        updates: { header: { cssStyles } },
      });
    },
    [mutation, project?.id],
  );

  const handleInject = useCallback(async () => {
    setError(null);
    setInfo(null);

    const validation = validateCssImport(css, maxInlineSize);
    if (validation) {
      setError(validation);
      return;
    }

    try {
      const res = await persistHeaderCss(css);
      if (res?.header?.cssStyles !== undefined) {
        setCssState(res.header.cssStyles);
      }
      dirtyRef.current = false;
      setInfo(
        "Injected CSS inline into preview (stored in project.header.cssStyles).",
      );
    } catch (err) {
      setError(errorMessage(err, "Failed to update project with inline CSS."));
    }
  }, [css, maxInlineSize, persistHeaderCss]);

  const handleClear = useCallback(async () => {
    setError(null);
    setInfo(null);

    try {
      const res = await persistHeaderCss("");
      setCssState(res?.header?.cssStyles ?? "");
      dirtyRef.current = false;
      setInfo("Cleared injected CSS.");
    } catch (err) {
      setError(errorMessage(err, "Failed to clear project header CSS."));
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [persistHeaderCss]);

  const handleFileChange = useCallback(async (file?: File | null) => {
    if (!file) return;
    if (!isCssUploadFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("Please select a CSS file (.css)");
      return;
    }
    try {
      const text = await file.text();
      dirtyRef.current = true;
      setCssState(text);
      setError(null);
      setInfo(`Read ${Math.round(text.length / 1024)} KB from file.`);
    } catch (err) {
      setError(errorMessage(err, "Failed to read file."));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  return {
    css,
    byteCount: cssByteLength(css),
    error,
    info,
    previewHtml: formatCssPreview(css),
    fileInputRef,
    setCss,
    handleInject,
    handleClear,
    handleFileChange,
  };
}
