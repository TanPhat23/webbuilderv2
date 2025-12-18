/**
 * Protected Editor Layout with RBAC
 *
 * This layout ensures users have access to the project before rendering the editor
 * and provides RBAC context to child components
 */

import { redirect } from "next/navigation";
import {
  requirePermission,
  Permission,
  getUserProjectAccess,
} from "@/lib/rbac";
import EditorProvider from "@/providers/editorprovider";
import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

interface EditorLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Server-side layout that protects the editor
 * Checks if user has permission to view the project
 */
export default async function ProtectedEditorLayout({
  children,
  params,
}: EditorLayoutProps) {
  const { id: projectId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  try {
    const access = await getUserProjectAccess(userId, projectId);

    if (!access) {
      redirect("/dashboard");
    }

    await requirePermission(userId, projectId, Permission.PROJECT_VIEW);

    return (
      <EditorLayoutWithContext projectId={projectId} userId={userId}>
        {children}
      </EditorLayoutWithContext>
    );
  } catch (error: any) {
    if (error.status === 403) {
      redirect("/dashboard");
    }

    console.error("[EditorLayout] Authorization error:", error);
    redirect("/dashboard");
  }
}

interface EditorLayoutWithContextProps {
  children: ReactNode;
  projectId: string;
  userId: string;
}

function EditorLayoutWithContext({
  children,
  projectId,
  userId,
}: EditorLayoutWithContextProps) {
  return (
    <EditorProvider projectId={projectId} userId={userId}>
      {children}
    </EditorProvider>
  );
}
