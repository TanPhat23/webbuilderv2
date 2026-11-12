import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import { projectService } from "@/features/projects";
import { FontFamilyPicker } from "../configurations/_shared/FontFamilyPicker";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { ColorRow } from "./ColorRow";
import { MoreToggle, Segmented, StyleSelect } from "./controls";
import type { StyleProps } from "./useStyleProps";

const WEIGHTS = [
  ["100", "Thin"],
  ["200", "Extra light"],
  ["300", "Light"],
  ["400", "Regular"],
  ["500", "Medium"],
  ["600", "Semibold"],
  ["700", "Bold"],
  ["800", "Extra bold"],
  ["900", "Black"],
].map(([value, label]) => ({ value, label }));
const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: v }));

export function TypographySection({ sp }: { sp: StyleProps }) {
  const [more, setMore] = useState(false);
  const { data: fonts = [] } = useQuery({
    queryKey: ["fonts"],
    queryFn: () => projectService.getFonts(),
  });

  return (
    <Section
      title="Typography"
      actions={
        <MoreToggle
          open={more}
          onToggle={() => setMore((m) => !m)}
          label="More text options"
        />
      }
    >
      <div className="relative flex min-w-0">
        {sp.breakpoint !== "default" && sp.values.fontFamily !== undefined && (
          <button
            type="button"
            disabled={sp.disabled}
            aria-label="Clear Font family override"
            title="Clear breakpoint override"
            onClick={() => sp.clear(["fontFamily"])}
            className="absolute -left-1 top-1/2 z-1 size-1.5 -translate-y-1/2 rounded-full bg-sky-500"
          />
        )}
        <FontFamilyPicker
          value={
            (sp.values.fontFamily ?? sp.inherited.fontFamily) as
              | string
              | undefined
          }
          onChange={(v) => sp.set("fontFamily", v)}
          fonts={fonts as string[]}
          className="h-[26px] text-[11px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <StyleSelect
          sp={sp}
          k="fontWeight"
          label="Font weight"
          options={WEIGHTS}
          placeholder="Weight"
        />
        <StyleField sp={sp} k="fontSize" prefix="Aa" label="Font size" />
        <StyleField
          sp={sp}
          k="lineHeight"
          prefix="↕"
          label="Line height (unitless = × font size)"
          defaultUnit=""
        />
        <StyleField
          sp={sp}
          k="letterSpacing"
          prefix="↔"
          label="Letter spacing"
        />
      </div>
      <Segmented
        value={
          (sp.values.textAlign ?? sp.inherited.textAlign) as string | undefined
        }
        options={[
          { value: "left", label: <AlignLeft />, title: "Align left" },
          { value: "center", label: <AlignCenter />, title: "Align centre" },
          { value: "right", label: <AlignRight />, title: "Align right" },
          { value: "justify", label: <AlignJustify />, title: "Justify" },
        ]}
        onChange={(v) => sp.set("textAlign", v)}
        disabled={sp.disabled}
      />
      <ColorRow sp={sp} k="color" label="Text colour" />
      {more && (
        <div className="grid grid-cols-2 gap-1.5">
          <StyleSelect
            sp={sp}
            k="fontStyle"
            label="Font style"
            options={opts(["normal", "italic"])}
            placeholder="Style"
          />
          <StyleSelect
            sp={sp}
            k="textTransform"
            label="Text case"
            options={opts(["none", "uppercase", "lowercase", "capitalize"])}
            placeholder="Case"
          />
          <StyleSelect
            sp={sp}
            k="textDecoration"
            label="Decoration"
            options={opts(["none", "underline", "line-through", "overline"])}
            placeholder="Decoration"
          />
          <StyleSelect
            sp={sp}
            k="whiteSpace"
            label="White space"
            options={opts(["normal", "nowrap", "pre", "pre-wrap", "pre-line"])}
            placeholder="White space"
          />
          <StyleSelect
            sp={sp}
            k="textOverflow"
            label="Text overflow"
            options={opts(["clip", "ellipsis"])}
            placeholder="Overflow"
          />
          <StyleSelect
            sp={sp}
            k="wordBreak"
            label="Word break"
            options={opts(["normal", "break-all", "keep-all", "break-word"])}
            placeholder="Word break"
          />
          <StyleSelect
            sp={sp}
            k="wordWrap"
            label="Word wrap"
            options={opts(["normal", "break-word"])}
            placeholder="Word wrap"
          />
        </div>
      )}
    </Section>
  );
}
