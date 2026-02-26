import { useRef, useState, useEffect } from "react";
import { useMonaco, type Monaco, type OnMount } from "@monaco-editor/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type * as monacoEditor from "monaco-editor";
import {
  MONACO_COMPILER_OPTIONS,
  DEFAULT_EDITOR_VALUE,
} from "@/features/editor/lib/monaco/constants";
import { registerPrettierFormatter } from "@/features/editor/lib/monaco/format";
import { loadMonacoTypes } from "@/features/editor/lib/monaco/types";
import { contentChange } from "@/features/editor/lib/monaco/content-change";
import { useElements } from "@/features/editor";
import { elementService } from "@/features/editor";

function useDebouncedValue<T>(value: T, delay = 50) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useMonacoEditor(initialValue: string = DEFAULT_EDITOR_VALUE) {
  const monaco = useMonaco();
  const elements = useElements();
  const [value, setValue] = useState<string>(initialValue);
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null,
  );

  const isEditorFocusedRef = useRef(false);
  const lastAppliedCodeRef = useRef<string | null>(null);
  const pendingCodeRef = useRef<string | null>(null);

  const queryClient = useQueryClient();

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      MONACO_COMPILER_OPTIONS,
    );
    registerPrettierFormatter(monaco);
  };

  const handleOnMount: OnMount = async (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent((e) => contentChange(e, editor));
    editor.onDidFocusEditorWidget(() => (isEditorFocusedRef.current = true));
    editor.onDidBlurEditorWidget(() => {
      isEditorFocusedRef.current = false;
      const pending = pendingCodeRef.current;
      if (pending && editorRef.current) {
        try {
          editorRef.current.setValue(pending);
          lastAppliedCodeRef.current = pending;
          setValue(pending);
        } catch (err) {
          console.error("Failed to apply pending generated code on blur", err);
        }
        pendingCodeRef.current = null;
      }
    });

    loadMonacoTypes(monaco).catch((err) => {
      console.error("Failed to load Monaco types", err);
    });

    const cached = queryClient.getQueryData(["generatedCode", elements]) as
      | { code?: string }
      | undefined;
    if (cached?.code) {
      try {
        setValue(cached.code);
        if (editorRef.current) {
          editorRef.current.setValue(cached.code);
          lastAppliedCodeRef.current = cached.code;
        }
      } catch (err) {
        console.error("Failed to set initial generated code on mount", err);
      }
    }
  };

  const debouncedElements = useDebouncedValue(elements, 50);

  const {
    data: generated,
    isFetching,
    error,
  } = useQuery<{ code?: string }, unknown, { code?: string }>({
    queryKey: ["generatedCode", debouncedElements],
    queryFn: async ({ signal }: { signal?: AbortSignal }) =>
      elementService.generateCode(debouncedElements, { signal }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!error) return;
    if ((error as any)?.name === "AbortError") return;
    console.error("Failed to generate code from server", error);
  }, [error]);

  const cancelGeneration = (silent = true) => {
    try {
      queryClient.cancelQueries({ queryKey: ["generatedCode"] }, { silent });
    } catch (err) {
      console.debug("cancelGeneration failed", err);
    }
  };

  useEffect(() => {
    return () => {
      cancelGeneration(true);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!generated) return;
    const code = (generated as { code?: string } | undefined)?.code ?? "";
    setValue(code);
    if (!isEditorFocusedRef.current && editorRef.current) {
      try {
        editorRef.current.setValue(code);
        lastAppliedCodeRef.current = code;
        pendingCodeRef.current = null;
      } catch (err) {
        console.error("Failed to apply generated code to editor", err);
      }
    } else {
      pendingCodeRef.current = code;
    }
  }, [generated]);

  const handleValueChange = (newValue: string | undefined) => {
    setValue(newValue ?? "");
  };

  return {
    value,
    setValue,
    editorRef,
    handleBeforeMount,
    monaco,
    handleOnMount,
    handleValueChange,
    cancelGeneration,
    isFetching,
    generated,
  };
}
