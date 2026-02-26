"use client";

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { createEditor, EditorState, SerializedEditorState } from "lexical";

import { editorTheme } from "@/features/richtexteditor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";

import { nodes } from "./nodes";
import { Plugins } from "./plugins";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

export function Editor({
  editorState,
  editorSerializedState,
  initialContent,
  onChange,
  onSerializedChange,
  onContentChange,
  placeholder = "Start typing...",
}: {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  initialContent?: string;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  onContentChange?: (content: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow h-full flex flex-col">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? {
              editorState: createEditor().parseEditorState(
                JSON.stringify(editorSerializedState),
              ),
            }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins placeholder={placeholder} initialContent={initialContent} />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState);
              onSerializedChange?.(editorState.toJSON());

              // Also call onContentChange if provided
              if (onContentChange) {
                const tempEditor = createEditor();
                tempEditor.setEditorState(editorState);
                tempEditor.read(() => {
                  const html = $generateHtmlFromNodes(tempEditor);
                  onContentChange(html);
                });
              }
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
