import type * as monacoEditor from "monaco-editor";

const SELF_CLOSING_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

export function contentChange(
  event: monacoEditor.editor.IModelContentChangedEvent,
  editor: monacoEditor.editor.IStandaloneCodeEditor,
) {
  const lastChange = event.changes[event.changes.length - 1];
  if (!lastChange) return;

  if (lastChange.text === ">") {
    const model = editor.getModel();
    if (!model) return;

    const position = editor.getPosition();
    if (!position) return;

    const lineContent = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineContent.substring(0, position.column - 1);

    const match = textBeforeCursor.match(/<([a-zA-Z0-9\-]+)(?:\s+[^>]*?)?>$/);

    if (match && !textBeforeCursor.endsWith("/>")) {
      const tagName = match[1];

      if (SELF_CLOSING_TAGS.includes(tagName.toLowerCase())) {
        return;
      }

      const closingTag = `</${tagName}>`;

      editor.executeEdits("auto-close-tag", [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: closingTag,
          forceMoveMarkers: false, // Keep cursor before the inserted closing tag
        },
      ]);
    }
  }
}
