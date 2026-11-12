import { useState } from "react";
import { Square, SquareDashed } from "lucide-react";
import { Section } from "./SectionHeader";
import { PropInput } from "./PropInput";
import {
  readSides,
  sidesDiffer,
  writeAxis,
  writeSide,
  type Sides,
} from "./styleModel";
import type { StyleProps } from "./useStyleProps";

type Prop = "padding" | "margin";
const SIDES: { side: keyof Sides; short: string }[] = [
  { side: "top", short: "T" },
  { side: "right", short: "R" },
  { side: "bottom", short: "B" },
  { side: "left", short: "L" },
];

function Group({
  sp,
  prop,
  perSide,
}: {
  sp: StyleProps;
  prop: Prop;
  perSide: boolean;
}) {
  const sides = readSides(sp.values, prop);
  const inh = readSides(sp.inherited, prop);
  const name = prop === "padding" ? "Padding" : "Margin";

  const common = { disabled: sp.disabled };
  const override = (axisOrSide: keyof Sides | "x" | "y") => {
    const suffixes =
      axisOrSide === "x"
        ? ["Left", "Right"]
        : axisOrSide === "y"
          ? ["Top", "Bottom"]
          : [axisOrSide[0].toUpperCase() + axisOrSide.slice(1)];
    return {
      overridden:
        sp.breakpoint !== "default" &&
        (sp.values[prop] !== undefined ||
          suffixes.some((s) => sp.values[prop + s] !== undefined)),
      onClearOverride: () =>
        sp.replace(
          axisOrSide === "x" || axisOrSide === "y"
            ? writeAxis(sp.values, prop, axisOrSide, undefined)
            : writeSide(sp.values, prop, axisOrSide, undefined),
        ),
    };
  };

  if (perSide || sidesDiffer(sides)) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {SIDES.map(({ side, short }) => (
          <PropInput
            key={side}
            {...override(side)}
            {...common}
            value={sides[side] || undefined}
            placeholder={inh[side] || "0"}
            prefix={short}
            label={`${name} ${side}`}
            onCommit={(v) => sp.replace(writeSide(sp.values, prop, side, v))}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <PropInput
        {...common}
        value={sides.left || undefined}
        placeholder={inh.left || "0"}
        prefix="X"
        {...override("x")}
        label={`${name} left and right`}
        onCommit={(v) => sp.replace(writeAxis(sp.values, prop, "x", v))}
      />
      <PropInput
        {...common}
        value={sides.top || undefined}
        placeholder={inh.top || "0"}
        prefix="Y"
        {...override("y")}
        label={`${name} top and bottom`}
        onCommit={(v) => sp.replace(writeAxis(sp.values, prop, "y", v))}
      />
    </div>
  );
}

export function SpacingSection({ sp }: { sp: StyleProps }) {
  const [perSide, setPerSide] = useState(false);
  return (
    <Section
      title="Spacing"
      actions={
        <button
          type="button"
          aria-pressed={perSide}
          title={perSide ? "Edit by axis" : "Edit each side"}
          onClick={() => setPerSide((v) => !v)}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {perSide ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <SquareDashed className="h-3.5 w-3.5" />
          )}
        </button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-muted-foreground">Padding</span>
        <Group sp={sp} prop="padding" perSide={perSide} />
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        <span className="text-[11px] text-muted-foreground">Margin</span>
        <Group sp={sp} prop="margin" perSide={perSide} />
      </div>
    </Section>
  );
}
