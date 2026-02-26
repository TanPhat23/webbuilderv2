"use client";

import Editor from "@monaco-editor/react";
import { useMonacoEditor } from "@/features/editor/hooks/useMonacoEditor";

export default function EditorCodePanel() {
  const {
    value,
    handleValueChange,
    handleBeforeMount,
    handleOnMount,
    // cancelGeneration is exposed by the hook to explicitly cancel in-flight generation requests
    cancelGeneration,
    // isFetching indicates an in-progress generation operation
    isFetching,
  } = useMonacoEditor();

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-2 right-2 z-10">
        {isFetching ? (
          <button
            type="button"
            onClick={() => cancelGeneration()}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Cancel
          </button>
        ) : null}
      </div>
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        defaultLanguage="typescript"
        path="src/example.tsx"
        value={value}
        onChange={handleValueChange}
        beforeMount={handleBeforeMount}
        onMount={handleOnMount}
        options={{
          smoothScrolling: true,
          padding: { top: 10 },
          minimap: { enabled: false },
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          fontSize: 14,
          fixedOverflowWidgets: true,
        }}
      />
    </div>
  );
}
