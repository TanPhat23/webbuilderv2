import { JSX } from "react";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root relative block min-h-full overflow-visible px-8 py-4 focus:outline-none`
      }
      aria-placeholder={placeholder}
      lang="vi"
      inputMode="text"
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      placeholder={
        <div
          className={
            placeholderClassName ??
            `text-muted-foreground pointer-events-none absolute top-4 left-8 overflow-hidden px-0 py-0 text-ellipsis select-none z-0`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
