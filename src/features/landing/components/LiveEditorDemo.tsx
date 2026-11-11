import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type BlockId = "heading" | "body" | "button";
type Size = "m" | "l" | "xl";
type Align = "left" | "center";

interface PageState {
  heading: string;
  body: string;
  button: string;
  size: Size;
  align: Align;
  filled: boolean;
}

const INITIAL: PageState = {
  heading: "Spring menu is live",
  body: "Twelve seats a night. Book before the first course sells out.",
  button: "Book a table",
  size: "xl",
  align: "left",
  filled: true,
};

const MAX_TEXT = 72;

const SIZE_CLASS: Record<Size, { canvas: string; code: string }> = {
  m: { canvas: "text-[1.35rem]", code: "text-3xl" },
  l: { canvas: "text-[1.75rem]", code: "text-4xl" },
  xl: { canvas: "text-[2.15rem]", code: "text-5xl" },
};

interface CodeLine {
  text: string;
  owner: BlockId | null;
}

/** The "export": plain JSX that mirrors whatever is on the canvas. */
function buildCode(s: PageState): CodeLine[] {
  const align = s.align === "center" ? "items-center text-center" : "items-start text-left";
  const button = s.filled
    ? "bg-black px-4 py-2 text-white"
    : "border border-black px-4 py-2";
  return [
    { text: "const Hero = () => {", owner: null },
    { text: "  return (", owner: null },
    { text: "    <>", owner: null },
    { text: `      <div className="flex flex-col gap-4 p-8 ${align}">`, owner: null },
    { text: `        <h1 className="${SIZE_CLASS[s.size].code} font-semibold">`, owner: "heading" },
    { text: `          ${s.heading}`, owner: "heading" },
    { text: "        </h1>", owner: "heading" },
    { text: `        <p className="text-neutral-600">`, owner: "body" },
    { text: `          ${s.body}`, owner: "body" },
    { text: "        </p>", owner: "body" },
    { text: `        <a href="/book" className="${button}">`, owner: "button" },
    { text: `          ${s.button}`, owner: "button" },
    { text: "        </a>", owner: "button" },
    { text: "      </div>", owner: null },
    { text: "    </>", owner: null },
    { text: "  );", owner: null },
    { text: "};", owner: null },
    { text: " ", owner: null },
    { text: "export default Hero;", owner: null },
  ];
}

const TOKEN = /(<\/?[A-Za-z0-9]+)|("[^"]*")|(\b(?:export|default|const|return)\b)|(\s[a-zA-Z]+=)/g;

/** Colour tags, strings and keywords. Plain text lines are left alone. */
function highlight(line: string): ReactNode[] {
  const isMarkup = line.trimStart().startsWith("<");
  if (!isMarkup && !/^\s*(export|return|const)\b/.test(line)) {
    return [line];
  }
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    const [token, tag, str, keyword, attr] = match;
    const tone = tag
      ? "text-[var(--landing-signal)]"
      : str
        ? "text-emerald-700 dark:text-emerald-300"
        : keyword
          ? "text-muted-foreground italic"
          : attr
            ? "text-foreground/70"
            : "";
    parts.push(
      <span key={match.index} className={tone}>
        {token}
      </span>,
    );
    last = match.index + token.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

function EditableText({
  value,
  onChange,
  onFocus,
  className,
  tag: Tag = "span",
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  onFocus: () => void;
  className?: string;
  tag?: "h1" | "p" | "span";
  label: string;
}) {
  // The initial text is rendered once as children; after that the browser owns
  // the DOM text so the caret never jumps while typing.
  const [initial] = useState(value);
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={label}
      onFocus={onFocus}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.preventDefault();
      }}
      onInput={(event) => {
        const el = event.currentTarget;
        let text = (el.textContent ?? "").replace(/\s+/g, " ");
        if (text.length > MAX_TEXT) {
          text = text.slice(0, MAX_TEXT);
          el.textContent = text;
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        onChange(text);
      }}
      className={cn("outline-none", className)}
    >
      {initial}
    </Tag>
  );
}

function Block({
  id,
  selected,
  chip,
  onSelect,
  children,
  className,
}: {
  id: BlockId;
  selected: boolean;
  chip: string;
  onSelect: (id: BlockId) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      onPointerDown={() => onSelect(id)}
      className={cn(
        "relative -m-1.5 cursor-text rounded-[2px] p-1.5 transition-shadow",
        selected
          ? "shadow-[0_0_0_1.5px_var(--landing-signal)]"
          : "hover:shadow-[0_0_0_1px_var(--landing-rule)]",
        className,
      )}
    >
      {selected && (
        <>
          <span className="font-label pointer-events-none absolute -top-[1.35rem] left-[-1.5px] bg-[var(--landing-signal)] px-1.5 py-[3px] leading-none text-primary-foreground">
            {chip}
          </span>
          {[
            "-left-[4px] -top-[4px]",
            "-right-[4px] -top-[4px]",
            "-bottom-[4px] -left-[4px]",
            "-bottom-[4px] -right-[4px]",
          ].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={cn(
                "pointer-events-none absolute size-[7px] border border-[var(--landing-signal)] bg-background",
                pos,
              )}
            />
          ))}
        </>
      )}
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; text: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-label text-muted-foreground">{label}</span>
      <div role="group" aria-label={label} className="flex border border-border">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "font-label px-2.5 py-1.5 transition-colors",
              value === option.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Cursor({
  name,
  tone,
  path,
  duration,
  still,
}: {
  name: string;
  tone: "signal" | "ink";
  path: { left: string[]; top: string[] };
  duration: number;
  still: boolean;
}) {
  const color = tone === "signal" ? "var(--landing-signal)" : "var(--landing-ink)";
  const textColor = tone === "signal" ? "var(--primary-foreground)" : "var(--landing-paper)";
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-20"
      initial={{ left: path.left[0], top: path.top[0] }}
      animate={still ? undefined : { left: path.left, top: path.top }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill={color} stroke="var(--landing-paper)" strokeWidth="1.2">
        <path d="M1 1 L1 16 L5 12.2 L8.2 19 L10.8 17.8 L7.7 11.2 L13.5 11 Z" />
      </svg>
      <span
        className="font-label absolute left-3.5 top-4 whitespace-nowrap px-1.5 py-[3px] leading-none"
        style={{ background: color, color: textColor }}
      >
        {name}
      </span>
    </motion.div>
  );
}

export default function LiveEditorDemo() {
  const reduceMotion = useReducedMotion() ?? false;
  const [page, setPage] = useState<PageState>(INITIAL);
  const [selected, setSelected] = useState<BlockId>("heading");
  const patch = (next: Partial<PageState>) => setPage((current) => ({ ...current, ...next }));
  const code = useMemo(() => buildCode(page), [page]);
  const centered = page.align === "center";


  return (
    <section id="try" className="relative scroll-mt-16 border-t border-border">
      <div className="container mx-auto px-4 py-20 lg:px-6 lg:py-32">
        <h2 data-cursor="h2 · Heading" className="font-display max-w-3xl text-[clamp(2.5rem,6vw,5rem)] leading-[1]">
          Don’t take our word for it. <span className="text-[var(--landing-signal)]">Edit this page.</span>
        </h2>
        {/* The product, live. */}
        <div
          role="group"
          aria-label="Interactive editor demo"
          className="mt-12 border border-foreground/80 bg-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <div className="flex min-h-8 flex-wrap items-center gap-x-6 gap-y-2">
              {selected === "heading" && (
                <>
                  <Segmented
                    label="Size"
                    value={page.size}
                    onChange={(size) => patch({ size })}
                    options={[
                      { value: "m", text: "M" },
                      { value: "l", text: "L" },
                      { value: "xl", text: "XL" },
                    ]}
                  />
                  <Segmented
                    label="Align"
                    value={page.align}
                    onChange={(align) => patch({ align })}
                    options={[
                      { value: "left", text: "Left" },
                      { value: "center", text: "Center" },
                    ]}
                  />
                </>
              )}
              {selected === "button" && (
                <Segmented
                  label="Style"
                  value={page.filled ? "filled" : "outline"}
                  onChange={(style) => patch({ filled: style === "filled" })}
                  options={[
                    { value: "filled", text: "Filled" },
                    { value: "outline", text: "Outline" },
                  ]}
                />
              )}
              {selected === "body" && (
                <span className="font-label text-muted-foreground">Paragraph — type to edit</span>
              )}
            </div>
            <div className="flex items-center gap-2" aria-label="People in this file">
              {[
                { initial: "M", name: "Maya", bg: "var(--landing-signal)", fg: "var(--primary-foreground)" },
                { initial: "D", name: "Dev", bg: "var(--landing-ink)", fg: "var(--landing-paper)" },
              ].map((person) => (
                <span
                  key={person.name}
                  title={person.name}
                  className="font-label grid size-6 place-items-center rounded-full"
                  style={{ background: person.bg, color: person.fg }}
                >
                  {person.initial}
                </span>
              ))}
              <span className="font-label text-muted-foreground">2 editing</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
            {/* Canvas */}
            <div className="blueprint relative min-h-[22rem] border-b border-border p-6 lg:border-b-0 lg:border-r lg:p-10">
              <span className="font-label absolute left-4 top-3 text-muted-foreground">Canvas</span>
              <Cursor
                name="Maya"
                tone="signal"
                duration={16}
                still={reduceMotion}
                path={{
                  left: ["62%", "28%", "46%", "62%"],
                  top: ["70%", "34%", "58%", "70%"],
                }}
              />
              <Cursor
                name="Dev"
                tone="ink"
                duration={21}
                still={reduceMotion}
                path={{
                  left: ["18%", "70%", "40%", "18%"],
                  top: ["82%", "46%", "20%", "82%"],
                }}
              />
              <div
                className={cn(
                  "relative mx-auto flex min-h-[17rem] max-w-md flex-col gap-5 border border-border bg-background p-8 shadow-[6px_6px_0_var(--landing-rule)]",
                  centered ? "items-center text-center" : "items-start text-left",
                )}
              >
                <Block
                  id="heading"
                  chip="h1 · Heading"
                  selected={selected === "heading"}
                  onSelect={setSelected}
                >
                  <EditableText
                    tag="h1"
                    label="Heading text"
                    value={page.heading}
                    onChange={(heading) => patch({ heading })}
                    onFocus={() => setSelected("heading")}
                    className={cn(
                      "font-display leading-[1.05] transition-[font-size] duration-200",
                      SIZE_CLASS[page.size].canvas,
                    )}
                  />
                </Block>
                <Block
                  id="body"
                  chip="p · Paragraph"
                  selected={selected === "body"}
                  onSelect={setSelected}
                >
                  <EditableText
                    tag="p"
                    label="Paragraph text"
                    value={page.body}
                    onChange={(body) => patch({ body })}
                    onFocus={() => setSelected("body")}
                    className="text-sm leading-relaxed text-muted-foreground"
                  />
                </Block>
                <Block
                  id="button"
                  chip="a · Button"
                  selected={selected === "button"}
                  onSelect={setSelected}
                >
                  <span
                    className={cn(
                      "inline-block px-4 py-2 text-sm font-medium transition-colors",
                      page.filled
                        ? "bg-foreground text-background"
                        : "border border-foreground text-foreground",
                    )}
                  >
                    <EditableText
                      label="Button label"
                      value={page.button}
                      onChange={(button) => patch({ button })}
                      onFocus={() => setSelected("button")}
                    />
                  </span>
                </Block>
              </div>
            </div>

            {/* Export */}
            <div className="min-w-0 bg-background">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="font-label text-muted-foreground">Hero.tsx</span>
                <span className="font-label text-[var(--landing-signal)]">Updates as you edit</span>
              </div>
              <pre
                aria-label="Generated React code"
                className="overflow-x-auto py-3 font-mono text-[0.78rem] leading-6"
                style={{ fontFamily: '"Geist Mono Variable", ui-monospace, monospace' }}
              >
                <code className="block min-w-max">
                  {code.map((line, index) => (
                    <span
                      key={index}
                      className={cn(
                        "block border-l-2 px-4 transition-colors",
                        line.owner && line.owner === selected
                          ? "border-[var(--landing-signal)] bg-[color-mix(in_srgb,var(--landing-signal)_10%,transparent)]"
                          : "border-transparent",
                      )}
                    >
                      {highlight(line.text)}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
