import { Viewport } from "@/hooks";
import { Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import * as Y from "yjs";

type EditorHeaderProps = {
  currentView: Viewport;
  setCurrentView: (view: Viewport) => void;
  projectId: string;
  isConnected?: boolean;
  isSynced?: boolean;
  ydoc?: Y.Doc | null;
  collabType?: "yjs" | "websocket";
};

export default function CollaborationStatus({
  isConnected,
  isSynced,
  collabType,
}: Pick<EditorHeaderProps, "isConnected" | "isSynced" | "collabType">) {
  const status =
    isConnected && isSynced
      ? {
          icon: Wifi,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          dotColor: "bg-emerald-500",
          pulse: false,
        }
      : isConnected
        ? {
            icon: Wifi,
            label: "Syncing...",
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            dotColor: "bg-amber-500",
            pulse: true,
          }
        : {
            icon: WifiOff,
            label: "Offline",
            color: "text-slate-400",
            bgColor: "bg-slate-500/10",
            dotColor: "bg-slate-400",
            pulse: false,
          };

  const StatusIcon = status.icon;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bgColor} backdrop-blur-sm transition-all duration-200`}
      role="status"
      aria-live="polite"
      aria-label={`Collaboration status: ${status.label}`}
    >
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-full ${status.dotColor} blur-sm ${
            status.pulse ? "animate-pulse" : ""
          }`}
          aria-hidden="true"
        />
        <StatusIcon className={`w-3.5 h-3.5 ${status.color} relative z-10`} />
      </div>
    </div>
  );
}