import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";

import { ContentEditable } from "@/features/richtexteditor/editor-ui/content-editable";

// Toolbar plugins
import { ToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/toolbar-plugin";
import { BlockFormatDropDown } from "@/features/richtexteditor/plugins/toolbar/block-format-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/element-format-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/font-format-toolbar-plugin";
import { FontSizeToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/font-size-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/font-family-toolbar-plugin";
import { FontColorToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/font-color-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/font-background-toolbar-plugin";
import { LinkToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/link-toolbar-plugin";
import { HistoryToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/history-toolbar-plugin";
import { ClearFormattingToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { SubSuperToolbarPlugin } from "@/features/richtexteditor/plugins/toolbar/subsuper-toolbar-plugin";

// Block format components
import { FormatParagraph } from "@/features/richtexteditor/plugins/toolbar/block-format/format-paragraph";
import { FormatHeading } from "@/features/richtexteditor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "@/features/richtexteditor/plugins/toolbar/block-format/format-numbered-list";
import { FormatBulletedList } from "@/features/richtexteditor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "@/features/richtexteditor/plugins/toolbar/block-format/format-check-list";
import { FormatQuote } from "@/features/richtexteditor/plugins/toolbar/block-format/format-quote";

// Block insert plugins
import { InsertImage } from "@/features/richtexteditor/plugins/toolbar/block-insert/insert-image";
import { InsertEmbeds } from "@/features/richtexteditor/plugins/toolbar/block-insert/insert-embeds";
import { BlockInsertDropDown } from "@/features/richtexteditor/plugins/toolbar/block-insert-toolbar-plugin";

// Other plugins
import { AutoLinkPlugin } from "@/features/richtexteditor/plugins/auto-link-plugin";
import { AutocompletePlugin } from "@/features/richtexteditor/plugins/autocomplete-plugin";
import { DragDropPastePlugin } from "@/features/richtexteditor/plugins/drag-drop-paste-plugin";
import { DraggableBlockPlugin } from "@/features/richtexteditor/plugins/draggable-block-plugin";
import { FloatingLinkEditorPlugin } from "@/features/richtexteditor/plugins/floating-link-editor-plugin";
import { ImagesPlugin } from "@/features/richtexteditor/plugins/images-plugin";
import { LinkPlugin } from "@/features/richtexteditor/plugins/link-plugin";
import { ListMaxIndentLevelPlugin } from "@/features/richtexteditor/plugins/list-max-indent-level-plugin";

export function Plugins({
  placeholder = "Start typing...",
  initialContent,
}: {
  placeholder?: string;
  initialContent?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  // Initialize editor with content when initialContent changes
  useEffect(() => {
    if (initialContent && initialContent.trim()) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialContent, "text/html");
        const generatedNodes = $generateNodesFromDOM(editor, dom);
        $insertNodes(generatedNodes);
      });
    }
  }, [editor, initialContent]);

  return (
    <>
      {/* Core plugins */}
      <RichTextPlugin
        contentEditable={
          <div className="relative h-full flex flex-col">
            <ToolbarPlugin>
              {({ blockType }) => (
                <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-muted/30 sticky top-0 z-10 shrink-0">
                  <BlockFormatDropDown>
                    <FormatParagraph />
                    <FormatHeading levels={["h1", "h2", "h3"]} />
                    <FormatNumberedList />
                    <FormatBulletedList />
                    <FormatCheckList />
                    <FormatQuote />
                  </BlockFormatDropDown>
                  <ElementFormatToolbarPlugin />
                  <FontFormatToolbarPlugin />
                  <FontSizeToolbarPlugin />
                  <FontFamilyToolbarPlugin />
                  <FontColorToolbarPlugin />
                  <FontBackgroundToolbarPlugin />
                  <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
                  <HistoryToolbarPlugin />
                  <ClearFormattingToolbarPlugin />
                  <SubSuperToolbarPlugin />
                  <BlockInsertDropDown>
                    <InsertImage />
                    <InsertEmbeds />
                  </BlockInsertDropDown>
                </div>
              )}
            </ToolbarPlugin>
            <div className="flex-1 overflow-y-auto min-h-0 relative">
              <div ref={onRef} className="h-full">
                <ContentEditable placeholder={placeholder} />
              </div>
            </div>
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <TablePlugin />
      <TabIndentationPlugin />
      <AutoFocusPlugin />

      {/* Toolbar */}

      {/* Other plugins */}
      <AutoLinkPlugin />
      <AutocompletePlugin />
      <DragDropPastePlugin />
      <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
      <FloatingLinkEditorPlugin
        anchorElem={floatingAnchorElem}
        isLinkEditMode={isLinkEditMode}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <ImagesPlugin />
      <LinkPlugin />
      <ListMaxIndentLevelPlugin maxDepth={7} />
    </>
  );
}
