/** Legacy links marked by the migration have a corresponding new interaction. */
export function unmigratedConnections<T extends { id: string }>(connections: T[], settings: unknown): T[] {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return connections;
  const marks = (settings as Record<string, unknown>).migratedWorkflowLinks;
  if (!marks || typeof marks !== "object" || Array.isArray(marks)) return connections;
  return connections.filter((connection) => !Object.hasOwn(marks, connection.id) || (marks as Record<string, unknown>)[connection.id] !== true);
}
