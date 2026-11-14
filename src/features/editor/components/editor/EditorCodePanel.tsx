import { useState } from "react";
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
    generated,
  } = useMonacoEditor();
  const [file, setFile] = useState<"component" | "interactions">("component");
  const interactions = generated?.interactions ?? null;
  // The interactions file disappears when the last interaction is removed.
  const showing = interactions ? file : "component";

  return (
    <div className="h-full w-full relative">
      {interactions ? (
        <div className="absolute top-2 left-2 z-10 flex gap-1 text-xs">
          {(["component", "interactions"] as const).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFile(name)}
              aria-pressed={showing === name}
              className={`px-2 py-1 rounded ${showing === name ? "bg-white/20 text-white" : "bg-black/40 text-white/70 hover:text-white"}`}
            >
              {name === "component" ? "Generated.tsx" : "interactions.ts"}
            </button>
          ))}
        </div>
      ) : null}
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
      <div className={showing === "interactions" ? "h-full w-full" : "hidden"}>
        {interactions ? (
          <Editor
            height="100%"
            width="100%"
            theme="vs-dark"
            defaultLanguage="typescript"
            path="src/interactions.ts"
            value={interactions}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 40 },
              automaticLayout: true,
            }}
          />
        ) : null}
      </div>
      <div className={showing === "component" ? "h-full w-full" : "hidden"}>
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
    </div>
  );
}
