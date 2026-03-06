import { ClerkProvider } from "@clerk/tanstack-react-start";
import QueryProvider from "./queryprovider";
import { ThemeProvider } from "./themeprovider";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
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