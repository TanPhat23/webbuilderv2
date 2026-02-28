"use client";

import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "./queryprovider";
import { ThemeProvider } from "./themeprovider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { shadcn } from "@clerk/themes";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadcn as any,
      }}
    >
      <QueryProvider>
        <SidebarProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SidebarProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
