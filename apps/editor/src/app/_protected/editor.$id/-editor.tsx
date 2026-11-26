import React from "react";
import CanvasStage from "@/features/editor/components/canvas/CanvasStage";
import CodeSplit from "@/features/editor/components/editor/CodeSplit";
import { DynamicPagePreviewBar } from "@/features/editor/components/editor/DynamicPagePreviewBar";
import { useEditorContext } from "@/providers/editorprovider";

const WireframeBoard = React.lazy(
  () => import("@/features/editor/components/wireframe/WireframeBoard"),
);

type EditorProps = {
  id: string;
};

const previewContent = (
  <div className="h-full w-full">
    <CanvasStage />
  </div>
);

export default function Editor(_props: EditorProps) {
  const { editingMode, mode } = useEditorContext();
  const isCodeMode = editingMode === "code";

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-background text-foreground relative">
      {mode !== "wireframe" && <DynamicPagePreviewBar />}
      <div className="flex-1 min-h-0 overflow-hidden">
        {mode === "wireframe" ? (
          <React.Suspense fallback={null}>
            <WireframeBoard />
          </React.Suspense>
        ) : isCodeMode ? (
          <CodeSplit canvas={previewContent} />
        ) : (
          previewContent
        )}
      </div>
    </div>
  );
}
