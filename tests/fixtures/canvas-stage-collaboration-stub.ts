// The real barrel pulls in realtime providers; the stage only needs the role enum
// and (through the context menu's permission hooks) an empty collaborator list.
export * from '../../apps/editor/src/features/collaboration/interfaces/collaboration.interface';

export function useProjectCollaborators(): { data: never[]; isLoading: false } {
  return { data: [], isLoading: false };
}
