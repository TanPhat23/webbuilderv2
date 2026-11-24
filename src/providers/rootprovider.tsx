import { ClerkProvider } from "@clerk/tanstack-react-start";
import QueryProvider from "./queryprovider";
import { ThemeProvider } from "./themeprovider";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootProviders({
  children,
  skipAuth = false,
}: {
  children: React.ReactNode;
  skipAuth?: boolean;
}) {
  const content = (
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
  );

  if (skipAuth) return content;
  return <ClerkProvider>{content}</ClerkProvider>;
}