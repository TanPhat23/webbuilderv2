import { useCallback, useEffect, useState } from "react";
import { Editor } from "@/components/richtexteditor/blocks/editor/editor";
import { AIChatbotBubble } from "@/components/ui/ai-chatbot-bubble";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter some text...",
}: RichTextEditorProps) {
  const [editorState, setEditorState] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  useEffect(() => {
    // Initialize with empty state if no value
    if (!value) {
      setEditorState(null);
      return;
    }

    // For now, just pass the value as initial content
    // The Editor component will handle initialization
    setEditorState(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      // Don't update while streaming
      if (!isStreaming) {
        onChange?.(newValue);
      }
    },
    [onChange, isStreaming],
  );

  const handleAIContentGenerated = useCallback(
    (content: string) => {
      setIsStreaming(true);
      setStreamingContent("");

      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < content.length) {
          const chunk = content.substring(0, currentIndex + 1);
          setStreamingContent(chunk);
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setIsStreaming(false);

          const newValue = value ? `${value}\n${content}` : content;
          onChange?.(newValue);
          setStreamingContent("");
        }
      }, 20); // Adjust speed here (lower = faster)

      return () => clearInterval(streamInterval);
    },
    [value, onChange],
  );

  // Combine current value with streaming content for display
  const displayValue = isStreaming
    ? (value ? `${value}\n${streamingContent}` : streamingContent)
    : value;

  return (
    <div className="h-full w-full relative">
      <Editor
        initialContent={displayValue || editorState}
        onContentChange={handleChange}
        placeholder={placeholder}
      />
      <AIChatbotBubble
        onContentGenerated={handleAIContentGenerated}
        fieldName="Rich Text Content"
        currentContent={value}
      />
    </div>
  );
}
