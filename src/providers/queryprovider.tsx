"use client";

import { useRef } from "react";
import { getQueryClient } from "@/client/queryclient";
import { QueryClientProvider } from "@tanstack/react-query";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientRef = useRef(getQueryClient());

  return (
    <QueryClientProvider client={clientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
