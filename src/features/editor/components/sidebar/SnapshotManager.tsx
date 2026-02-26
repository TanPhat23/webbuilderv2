import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/features/editor";
import { useElementsWithLoad } from "@/features/editor";
import { History, Save, RotateCcw } from "lucide-react";
import {
  useSnapshots,
  useSaveSnapshot,
  useLoadSnapshot,
} from "@/features/editor/hooks/useSnapshot";
import { EditorElement } from "@/types/global.type";

const SnapshotManager = () => {
  const [open, setOpen] = useState(false);
  const { project } = useProjectStore();
  const { elements, loadElements } = useElementsWithLoad();

  const { data: snapshots = [], isLoading: loading } = useSnapshots(
    project?.id,
  );
  const saveSnapshotMutation = useSaveSnapshot();
  const loadSnapshotMutation = useLoadSnapshot();

  const handleSaveSnapshot = async () => {
    if (!project?.id) return;
    if (!elements || elements.length === 0) {
      return;
    }

    const snapshot = {
      id: `snapshot-${Date.now()}`,
      elements: elements,
      type: "version" as const,
      name: `Version ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    };

    saveSnapshotMutation.mutate({ projectId: project.id, snapshot });
  };

  const handleLoadSnapshot = async (snapshotId: string) => {
    if (!project?.id) return;

    loadSnapshotMutation.mutate(
      { projectId: project.id, snapshotId },
      {
        onSuccess: (elements) => {
          loadElements(elements as EditorElement[]);
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full">
          <History className="h-4 w-4" />
          Manage Snapshots
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[75vw] max-h-[95vh] h-[75vw] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Snapshot Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Project Snapshots</h3>
            <Button
              onClick={handleSaveSnapshot}
              className="gap-2"
              disabled={saveSnapshotMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {saveSnapshotMutation.isPending
                ? "Saving..."
                : "Save Current Version"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">Loading snapshots...</div>
            ) : snapshots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No snapshots found. Save your first version!
              </div>
            ) : (
              <div className="space-y-2">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{snapshot.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(snapshot.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Type: {snapshot.type}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadSnapshot(snapshot.id)}
                      className="gap-2"
                      disabled={loadSnapshotMutation.isPending}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {loadSnapshotMutation.isPending ? "Loading..." : "Load"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SnapshotManager;
