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
import { useElements, useReplaceTree, useElementStore } from "@/features/editor";
import { elementService } from "@/features/editor";
import { diffTrees } from "@/features/editor/utils/element/treeDiff";
import { isEqual } from "lodash-es";
import { loadPreamble, savePreamble, type Preamble } from "@/features/editor/lib/code/customCode";
import { useEditorFlagsOptional } from "@/features/editor/components/context/EditorFlagsContext";
import { useActiveLogic } from "@/features/interactions/logic-hooks";

function useDebouncedValue<T>(value: T, delay = 50) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** How long typing pauses before the code is applied to the design. */
const APPLY_DELAY_MS = 500;
const MARKER_OWNER = "webbuilder-code";

export function useMonacoEditor(initialValue: string = DEFAULT_EDITOR_VALUE) {
  const monaco = useMonaco();
  const elements = useElements();
  // Variables and flows in scope on this page, so interactions generate with them.
  const { variables, flows } = useActiveLogic();
  const [value, setValue] = useState<string>(initialValue);
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null,
  );

  const canEdit = useEditorFlagsOptional()?.canEdit ?? false;
  const pageId = useElementStore((s) => s.activePage?.pageId);
  // Imports and hooks the user wrote around the JSX; kept per page in this browser.
  const [preamble, setPreamble] = useState<Preamble>(() => loadPreamble(pageId));
  const preambleRef = useRef(preamble);
  preambleRef.current = preamble;
  useEffect(() => setPreamble(loadPreamble(pageId)), [pageId]);
  const replaceTree = useReplaceTree();
  const monacoRef = useRef<Monaco | null>(null);
  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always the latest, so a delayed apply reads the current page, not the one it was scheduled on.
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const generatedCodeRef = useRef<string | undefined>(undefined);

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
    monacoRef.current = monaco;

    editor.onDidChangeModelContent((e) => contentChange(e, editor));
    editor.onDidFocusEditorWidget(() => (isEditorFocusedRef.current = true));
    editor.onDidBlurEditorWidget(() => {
      isEditorFocusedRef.current = false;
      const pending = pendingCodeRef.current;
      if (pending && editorRef.current) {
        try {
          lastAppliedCodeRef.current = pending;
          editorRef.current.setValue(pending);
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

    const cached = queryClient.getQueryData(["generatedCode", elements, variables, flows, preamble]) as
      | { code?: string }
      | undefined;
    if (cached?.code) {
      try {
        setValue(cached.code);
        if (editorRef.current) {
          lastAppliedCodeRef.current = cached.code;
          editorRef.current.setValue(cached.code);
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
  } = useQuery<
    { code?: string; interactions?: string | null },
    unknown,
    { code?: string; interactions?: string | null }
  >({
    queryKey: ["generatedCode", debouncedElements, variables, flows, preamble],
    queryFn: async ({ signal }: { signal?: AbortSignal }) =>
      elementService.generateCode(debouncedElements, { signal }, { variables, flows }, preamble),
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
    generatedCodeRef.current = code;
    if (!isEditorFocusedRef.current && editorRef.current) {
      try {
        // Set first: the editor reports this write as a change, which must not
        // be mistaken for typing.
        lastAppliedCodeRef.current = code;
        setValue(code);
        editorRef.current.setValue(code);
        pendingCodeRef.current = null;
        clearDiagnostics();
      } catch (err) {
        console.error("Failed to apply generated code to editor", err);
      }
    } else if (editorRef.current) {
      // Being typed in: hold the regenerated code until the editor loses focus.
      pendingCodeRef.current = code;
    } else {
      setValue(code);
    }
  }, [generated]);

  const clearDiagnostics = () => {
    const model = editorRef.current?.getModel();
    if (model && monacoRef.current) {
      monacoRef.current.editor.setModelMarkers(model, MARKER_OWNER, []);
    }
  };

  /** Reads the edited code back into the design, or marks what it couldn't read. */
  const applyCode = async (code: string) => {
    const { parseCode } = await import("@/features/editor/lib/code/parseCode");
    // The page may have changed, or the code been edited again, while loading.
    if (editorRef.current && editorRef.current.getValue() !== code) return;

    const activePageId = useElementStore.getState().activePage?.pageId;
    const result = parseCode(code, elementsRef.current, activePageId);
    const model = editorRef.current?.getModel();
    const monaco = monacoRef.current;
    if (!result.ok) {
      if (model && monaco) {
        const d = result.diagnostic;
        monaco.editor.setModelMarkers(model, MARKER_OWNER, [
          {
            severity: monaco.MarkerSeverity.Error,
            message: d.message,
            startLineNumber: d.line,
            startColumn: d.column,
            endLineNumber: d.endLine,
            endColumn: Math.max(d.endColumn, d.column + 1),
          },
        ]);
      }
      return;
    }
    clearDiagnostics();
    // Code around the JSX (imports, hooks) is kept for the page so regenerating keeps it.
    if (!isEqual(result.preamble, preambleRef.current)) {
      savePreamble(activePageId, result.preamble);
      setPreamble(result.preamble);
    }
    if (diffTrees(elementsRef.current, result.elements).length === 0) return;
    replaceTree(result.elements);
  };

  const handleValueChange = (newValue: string | undefined) => {
    const next = newValue ?? "";
    setValue(next);
    // Writes from the generator are not edits.
    if (next === lastAppliedCodeRef.current || next === generatedCodeRef.current) return;
    if (!canEdit) return;
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = setTimeout(() => {
      applyTimerRef.current = null;
      applyCode(next).catch((err) => console.error("Failed to apply code edits", err));
    }, APPLY_DELAY_MS);
  };

  useEffect(
    () => () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    },
    [],
  );

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
    canEdit,
  };
}
