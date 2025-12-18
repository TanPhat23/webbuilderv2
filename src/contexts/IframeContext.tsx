"use client";

import React, { createContext, useContext, RefObject } from "react";

interface IframeContextType {
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

const IframeContext = createContext<IframeContextType | undefined>(undefined);

export function IframeProvider({
  children,
  iframeRef,
}: {
  children: React.ReactNode;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}) {
  return (
    <IframeContext.Provider value={{ iframeRef }}>
      {children}
    </IframeContext.Provider>
  );
}

export function useIframeRef(): RefObject<HTMLIFrameElement | null> {
  const context = useContext(IframeContext);
  if (!context) {
    // Return a null ref if context is not available
    return { current: null };
  }
  return context.iframeRef;
}
