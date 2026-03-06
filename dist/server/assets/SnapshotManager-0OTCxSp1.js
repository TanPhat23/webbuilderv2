import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { W as onMutationError, ad as showSuccessToast, ac as useProjectStore, J as Dialog, af as DialogTrigger, B as Button, K as DialogContent, L as DialogHeader, M as DialogTitle } from "./prisma-Cq49YOYM.js";
import { x as useElementsWithLoad } from "./SelectComponent-t_K3xf5i.js";
import { History, Save, RotateCcw } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { e as elementService } from "./router-C8tq5DJa.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-DZpoDDoq.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-BDhK7YnG.js";
import "./checkbox-BX2VzNwa.js";
import "@clerk/react/internal";
import "./index-CSLGDVeV.js";
import "@clerk/shared/error";
import "./env-VSwWZfm9.js";
import "@clerk/shared/getEnvVariable";
import "@clerk/shared/underscore";
import "./auth-BkVoR3zB.js";
import "@clerk/backend/internal";
import "@clerk/backend";
import "@babel/generator";
import "@babel/types";
const useSnapshots = (projectId) => {
  return useQuery({
    queryKey: ["snapshots", projectId],
    queryFn: () => elementService.getSnapshots(projectId),
    enabled: !!projectId
  });
};
const useSaveSnapshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      snapshot
    }) => elementService.saveSnapshot(projectId, snapshot),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["snapshots", projectId] });
      showSuccessToast("Snapshot saved successfully");
    },
    onError: onMutationError("Failed to save snapshot")
  });
};
const useLoadSnapshot = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      snapshotId
    }) => elementService.loadSnapshot(projectId, snapshotId),
    onSuccess: (elements) => {
      showSuccessToast("Snapshot loaded successfully");
      return elements;
    },
    onError: onMutationError("Failed to load snapshot")
  });
};
const SnapshotManager = () => {
  const [open, setOpen] = useState(false);
  const { project } = useProjectStore();
  const { elements, loadElements } = useElementsWithLoad();
  const { data: snapshots = [], isLoading: loading } = useSnapshots(
    project?.id
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
      elements,
      type: "version",
      name: `Version ${(/* @__PURE__ */ new Date()).toLocaleString()}`,
      timestamp: Date.now(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveSnapshotMutation.mutate({ projectId: project.id, snapshot });
  };
  const handleLoadSnapshot = async (snapshotId) => {
    if (!project?.id) return;
    loadSnapshotMutation.mutate(
      { projectId: project.id, snapshotId },
      {
        onSuccess: (elements2) => {
          loadElements(elements2);
          setOpen(false);
        }
      }
    );
  };
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2 w-full", children: [
      /* @__PURE__ */ jsx(History, { className: "h-4 w-4" }),
      "Manage Snapshots"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-[75vw] max-h-[95vh] h-[75vw] overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(History, { className: "h-5 w-5" }),
        "Snapshot Management"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Project Snapshots" }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleSaveSnapshot,
              className: "gap-2",
              disabled: saveSnapshotMutation.isPending,
              children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                saveSnapshotMutation.isPending ? "Saving..." : "Save Current Version"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: "Loading snapshots..." }) : snapshots.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-gray-500", children: "No snapshots found. Save your first version!" }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: snapshots.map((snapshot) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-3 border rounded-lg",
            children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium", children: snapshot.name }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: new Date(snapshot.createdAt).toLocaleString() }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
                  "Type: ",
                  snapshot.type
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => handleLoadSnapshot(snapshot.id),
                  className: "gap-2",
                  disabled: loadSnapshotMutation.isPending,
                  children: [
                    /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
                    loadSnapshotMutation.isPending ? "Loading..." : "Load"
                  ]
                }
              )
            ]
          },
          snapshot.id
        )) }) })
      ] })
    ] })
  ] });
};
export {
  SnapshotManager as default
};
