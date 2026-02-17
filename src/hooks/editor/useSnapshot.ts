import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { elementService } from "@/services/element";
import { Snapshot } from "@/interfaces/snapshot.interface";
import { showSuccessToast } from "@/lib/utils/errors/errorToast";
import { onMutationError } from "@/lib/utils/hooks/mutationUtils";

/** Hook to get all snapshots for a project. */
export const useSnapshots = (projectId?: string) => {
  return useQuery({
    queryKey: ["snapshots", projectId],
    queryFn: () => elementService.getSnapshots(projectId!),
    enabled: !!projectId,
  });
};

/** Hook to save a snapshot for a project. */
export const useSaveSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      snapshot,
    }: {
      projectId: string;
      snapshot: Snapshot;
    }) => elementService.saveSnapshot(projectId, snapshot),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["snapshots", projectId] });
      showSuccessToast("Snapshot saved successfully");
    },
    onError: onMutationError("Failed to save snapshot"),
  });
};

/** Hook to load a specific snapshot for a project. */
export const useLoadSnapshot = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      snapshotId,
    }: {
      projectId: string;
      snapshotId: string;
    }) => elementService.loadSnapshot(projectId, snapshotId),
    onSuccess: (elements) => {
      showSuccessToast("Snapshot loaded successfully");
      return elements;
    },
    onError: onMutationError("Failed to load snapshot"),
  });
};
