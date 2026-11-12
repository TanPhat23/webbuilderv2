import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  WrapText,
} from "lucide-react";
import { AlignmentControl } from "./AlignmentControl";
import { Section } from "./SectionHeader";
import { StyleField } from "./PropInput";
import { MoreToggle, Segmented, StyleSelect } from "./controls";
import type { StyleProps } from "./useStyleProps";

const DISPLAY = [
  { value: "block", label: "Block", title: "Block" },
  { value: "flex", label: "Flex", title: "Flex (auto layout)" },
  { value: "grid", label: "Grid", title: "Grid" },
  { value: "none", label: "None", title: "Hidden (display: none)" },
];

const ALIGN_SELF = [
  "auto",
  "flex-start",
  "center",
  "flex-end",
  "stretch",
  "baseline",
].map((v) => ({ value: v, label: v }));
const OBJECT_FIT = ["fill", "contain", "cover", "none", "scale-down"].map(
  (v) => ({ value: v, label: v }),
);

export function LayoutSection({ sp }: { sp: StyleProps }) {
  const [more, setMore] = useState(false);
  const display = String(sp.values.display ?? sp.inherited.display ?? "");
  const isFlex = display === "flex" || display === "inline-flex";
  const isGrid = display === "grid" || display === "inline-grid";
  const wrap = (sp.values.flexWrap ?? sp.inherited.flexWrap) === "wrap";

  return (
    <Section
      title="Layout"
      actions={
        <MoreToggle
          open={more}
          onToggle={() => setMore((m) => !m)}
          label="More size options"
        />
      }
    >
      <Segmented
        value={display}
        options={DISPLAY}
        onChange={(v) => sp.set("display", v)}
        disabled={sp.disabled}
      />

      {isFlex && (
        <>
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Segmented
                value={String(
                  sp.values.flexDirection ??
                    sp.inherited.flexDirection ??
                    "row",
                )}
                options={[
                  { value: "row", label: <ArrowRight />, title: "Horizontal" },
                  { value: "column", label: <ArrowDown />, title: "Vertical" },
                  {
                    value: "row-reverse",
                    label: <ArrowLeft />,
                    title: "Reverse horizontal",
                  },
                  {
                    value: "column-reverse",
                    label: <ArrowUp />,
                    title: "Reverse vertical",
                  },
                ]}
                onChange={(v) => sp.set("flexDirection", v)}
                disabled={sp.disabled}
              />
              <div className="grid grid-cols-2 gap-2">
                <StyleField
                  sp={sp}
                  k="gap"
                  prefix="G"
                  label="Gap between children"
                />
                <button
                  type="button"
                  aria-pressed={wrap}
                  title="Wrap children onto new lines"
                  disabled={sp.disabled}
                  onClick={() => sp.set("flexWrap", wrap ? "nowrap" : "wrap")}
                  className={
                    wrap
                      ? "flex h-7 items-center justify-center gap-1 rounded-[5px] bg-accent text-[11px] text-foreground ring-1 ring-border/50"
                      : "flex h-7 items-center justify-center gap-1 rounded-[5px] bg-muted/40 text-[11px] text-muted-foreground hover:text-foreground"
                  }
                >
                  <WrapText className="h-3 w-3" /> Wrap
                </button>
              </div>
            </div>
            <AlignmentControl sp={sp} />
          </div>
        </>
      )}

      {isGrid && (
        <div className="grid grid-cols-2 gap-1.5">
          <StyleField
            sp={sp}
            k="gridTemplateColumns"
            prefix="C"
            label="Grid columns (e.g. repeat(3, 1fr))"
            free
          />
          <StyleField
            sp={sp}
            k="gridTemplateRows"
            prefix="R"
            label="Grid rows"
            free
          />
          <StyleField
            sp={sp}
            k="gap"
            prefix="G"
            label="Gap between cells"
            className="col-span-2"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        <StyleField sp={sp} k="width" prefix="W" label="Width" />
        <StyleField sp={sp} k="height" prefix="H" label="Height" />
      </div>

      {more && (
        <>
          {(isFlex || isGrid) && (
            <div className="grid grid-cols-2 gap-1.5">
              <StyleField sp={sp} k="rowGap" prefix="R↔" label="Row gap" />
              <StyleField
                sp={sp}
                k="columnGap"
                prefix="C↔"
                label="Column gap"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            <StyleField sp={sp} k="minWidth" prefix="W↓" label="Min width" />
            <StyleField sp={sp} k="maxWidth" prefix="W↑" label="Max width" />
            <StyleField sp={sp} k="minHeight" prefix="H↓" label="Min height" />
            <StyleField sp={sp} k="maxHeight" prefix="H↑" label="Max height" />
            <StyleField
              sp={sp}
              k="aspectRatio"
              prefix="AR"
              label="Aspect ratio (e.g. 16 / 9)"
              free
            />
            <StyleSelect
              sp={sp}
              k="objectFit"
              label="Object fit (images, video)"
              options={OBJECT_FIT}
              placeholder="Fit"
            />
          </div>
          <p className="pt-1 text-[10px] text-muted-foreground">
            Inside a flex parent
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <StyleSelect
              sp={sp}
              k="alignSelf"
              label="Align self"
              options={ALIGN_SELF}
              placeholder="Align self"
            />
            <StyleField sp={sp} k="flexBasis" prefix="B" label="Flex basis" />
            <StyleField
              sp={sp}
              k="flexGrow"
              prefix="G"
              label="Flex grow"
              defaultUnit=""
            />
            <StyleField
              sp={sp}
              k="flexShrink"
              prefix="S"
              label="Flex shrink"
              defaultUnit=""
            />
            <StyleField
              sp={sp}
              k="order"
              prefix="#"
              label="Order"
              defaultUnit=""
            />
          </div>
        </>
      )}
    </Section>
  );
}
