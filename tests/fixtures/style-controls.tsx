import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../../src/app/globals.css";
import { Tabs, TabsList, TabsTrigger } from "../../src/components/ui/tabs";
import { PositionSection } from "../../src/features/editor/components/sidebar/style/PositionSection";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { PropInput } from "../../src/features/editor/components/sidebar/style/PropInput";
import { LayoutSection } from "../../src/features/editor/components/sidebar/style/LayoutSection";
import { SpacingSection } from "../../src/features/editor/components/sidebar/style/SpacingSection";
import { FillSection } from "../../src/features/editor/components/sidebar/style/FillSection";
import { BorderSection } from "../../src/features/editor/components/sidebar/style/BorderSection";
import { ShadowSection } from "../../src/features/editor/components/sidebar/style/ShadowSection";
import { EffectsSection } from "../../src/features/editor/components/sidebar/style/EffectsSection";
import { BreakpointButtons } from "../../src/features/editor/components/sidebar/style/BreakpointButtons";
import {
  compactStyles,
  withoutKeys,
  type StyleMap,
} from "../../src/features/editor/components/sidebar/style/styleModel";
import type { StyleProps } from "../../src/features/editor/components/sidebar/style/useStyleProps";
function Harness() {
  const visual = new URLSearchParams(location.search).has("visual");
  const [values, replace] = useState<StyleMap>({
    width: visual ? "100%" : "1.5rem",
    ...(visual
      ? {
          gap: "16px",
          backgroundColor: "var(--card)",
          borderWidth: "1px",
          borderColor: "currentColor",
          borderStyle: "solid",
          justifyContent: "center",
          alignItems: "center",
        }
      : {}),
    display: "flex",
    padding: visual ? "32px 24px" : "8px 16px",
  });
  const [disabled, setDisabled] = useState(false);
  const sp: StyleProps = {
    element: undefined,
    values,
    inherited: { height: "80px" },
    disabled,
    breakpoint: visual ? "default" : "md",
    replace,
    set: (k, v) => replace((s) => compactStyles({ ...s, [k]: v })),
    setMany: (p) => replace((s) => ({ ...s, ...p })),
    clear: (keys) => replace((s) => withoutKeys(s, keys)),
  };
  return (
    <>
      {!visual && (
        <button onClick={() => setDisabled((v) => !v)}>Toggle lock</button>
      )}
      <aside className="bg-card text-card-foreground" style={{ width: 280 }}>
        <Tabs value="style">
          <div className="flex h-10 items-center gap-1 border-b border-border pl-2 pr-1.5">
            <TabsList variant="line" className="h-7! shrink-0 gap-0">
              <TabsTrigger value="style" className="px-1.5 text-[11px]">
                Style
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-1.5 text-[11px]">
                Settings
              </TabsTrigger>
            </TabsList>
            <span className="flex-1" />
            <BreakpointButtons
              value={visual ? "default" : "md"}
              onChange={() => {}}
            />
            <button
              aria-label="Collapse"
              className="size-6 shrink-0 text-muted-foreground"
            >
              ⌑
            </button>
          </div>
        </Tabs>
        {visual && (
          <div className="flex h-10 items-center gap-2 border-b border-border/45 px-3">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              Section
            </span>
            <span className="text-xs">Section</span>
            <span className="ml-auto text-muted-foreground">···</span>
          </div>
        )}
        <fieldset disabled={disabled} className="min-w-0 border-0 p-0">
          <LayoutSection sp={sp} />
          <SpacingSection sp={sp} />
          <PositionSection sp={sp} />
          <FillSection sp={sp} />
          <BorderSection sp={sp} />
          <ShadowSection sp={sp} />
          <EffectsSection sp={sp} />
          {!visual && (
            <PropInput
              label="Keyword"
              prefix="K"
              value={values.keyword ?? "auto"}
              onCommit={(v) => sp.set("keyword", v)}
            />
          )}
        </fieldset>
      </aside>
      {!visual && <output>{JSON.stringify(values)}</output>}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <Harness />
  </TooltipProvider>,
);
