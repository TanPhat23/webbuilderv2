import React from "react";
import type { FormElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function FormView({ element, rootProps, children }: ViewProps<FormElement>) {
  const settings = element.settings || {};

  return (
    <form
      action={settings.action}
      method={settings.method || "post"}
      target={settings.target}
      encType={settings.encType}
      acceptCharset={settings.acceptCharset}
      {...rootProps}
    >
      {children}
    </form>
  );
}
