/** Full edit rights without Clerk or the permissions API. */
export function useEditorPermissions(): Record<string, unknown> {
  return {
    role: 'owner',
    canEditElements: true,
    canCreateElements: true,
    canDeleteElements: true,
    canReorderElements: true,
  };
}
