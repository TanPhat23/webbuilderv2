import React from "react";
import { Shield } from "lucide-react";
import { useSelectedElement, useUpdateElement } from "@/features/editor";
import {
  readElementAuthVisibility,
  type AuthVisibility,
} from "@/lib/site-auth";
import { ConfigPanel } from "./_shared";
import { ConfigSelectInput } from "./_shared/ConfigInputs";

const AUTH_VISIBILITY_OPTIONS: ReadonlyArray<{
  readonly value: AuthVisibility;
  readonly label: string;
}> = [
  { value: "always", label: "Always visible" },
  { value: "authenticated", label: "Signed-in only" },
  { value: "guest", label: "Guests only" },
];

export default function AuthVisibilityConfiguration(): React.JSX.Element | null {
  const selectedElement = useSelectedElement();
  const updateElement = useUpdateElement();

  if (!selectedElement) return null;

  const current: AuthVisibility =
    readElementAuthVisibility(selectedElement.settings) ?? "always";

  const handleChange = (value: string): void => {
    const nextSettings: Record<string, unknown> = {
      ...((selectedElement.settings as Record<string, unknown> | null) ?? {}),
    };
    if (value === "authenticated" || value === "guest") {
      nextSettings.authVisibility = value;
    } else {
      delete nextSettings.authVisibility;
    }
    updateElement(selectedElement.id, { settings: nextSettings });
  };

  return (
    <ConfigPanel
      value="auth-visibility"
      icon={<Shield className="h-3.5 w-3.5" />}
      title="Auth Visibility"
      trailing={
        current !== "always" && (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
            {current === "authenticated" ? "signed-in" : "guests"}
          </span>
        )
      }
    >
      <ConfigSelectInput
        id="element-auth-visibility"
        label="Show to"
        hint="Conditionally render this element based on the visitor's Supabase Auth session (e.g. swap Sign In / Account links)."
        value={current}
        onValueChange={handleChange}
        options={[...AUTH_VISIBILITY_OPTIONS]}
        className="h-7 w-[140px] px-2 text-[11px] rounded-md"
      />
    </ConfigPanel>
  );
}
