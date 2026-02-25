import React from "react";
import { redirect } from "next/navigation";
import {
  requirePermission,
  Permission,
  getUserProjectAccess,
} from "@/lib/rbac";
import EditorProvider from "@/providers/editorprovider";
import { auth } from "@clerk/nextjs/server";

interface EditorLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProtectedEditorLayout({
  children,
  params,
}: EditorLayoutProps) {
  const { id: projectId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  try {
    const access = await getUserProjectAccess(userId, projectId);
    if (!access) redirect("/dashboard");

    await requirePermission(userId, projectId, Permission.PROJECT_VIEW);
  } catch (error) {
    console.error("[EditorLayout] Authorization error:", error);
    redirect("/dashboard");
  }

  return (
    <EditorProvider projectId={projectId} userId={userId}>
      {children}
    </EditorProvider>
  );
}
