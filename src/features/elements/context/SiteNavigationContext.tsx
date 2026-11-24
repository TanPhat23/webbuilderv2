import React, { createContext, useContext } from "react";
import type { RoutePageSummary, SiteRoutingMode } from "@/lib/site-routing";

export interface SiteNavigationContextValue {
  readonly mode: SiteRoutingMode;
  readonly pages: ReadonlyArray<RoutePageSummary>;
  readonly currentPath: string;
  readonly itemSlug?: string;
  readonly navigate: (
    href: string,
    opts?: { readonly newTab?: boolean; readonly replace?: boolean },
  ) => void;
}

const SiteNavigationContext = createContext<SiteNavigationContextValue | null>(
  null,
);

export function SiteNavigationProvider({
  value,
  children,
}: {
  readonly value: SiteNavigationContextValue;
  readonly children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <SiteNavigationContext.Provider value={value}>
      {children}
    </SiteNavigationContext.Provider>
  );
}

export function useSiteNavigationOptional(): SiteNavigationContextValue | null {
  return useContext(SiteNavigationContext);
}
