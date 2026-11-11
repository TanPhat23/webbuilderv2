import React, { useMemo, memo } from "react";
import { MousePointer } from "lucide-react";
import { useCollaborationCursors } from "@/features/editor";

interface RemoteCursorsOverlayProps {
  userId: string;
  scrollOffset: { x: number; y: number };
}

export const RemoteCursorsOverlay: React.FC<RemoteCursorsOverlayProps> = ({
  userId,
  scrollOffset,
}) => {
  const { remoteUsers, users } = useCollaborationCursors();

  const remoteCursors = useMemo(() => {
    if (!remoteUsers) return [];

    return Object.entries(remoteUsers)
      .filter(([uid]) => uid !== userId)
      .filter(([_, pos]) => {
        // Filter out "hidden" cursors (sent as -1, -1 on mouse leave)
        const x = typeof pos.x === "number" ? pos.x : 0;
        const y = typeof pos.y === "number" ? pos.y : 0;
        return x >= 0 && y >= 0;
      })
      .map(([uid, pos]) => {
        const x = typeof pos.x === "number" ? pos.x : 0;
        const y = typeof pos.y === "number" ? pos.y : 0;

        return {
          uid,
          x: x - scrollOffset.x,
          y: y - scrollOffset.y,
          userName: users[uid]?.userName || `User ${uid.slice(0, 8)}`,
        };
      });
  }, [remoteUsers, userId, users, scrollOffset]);

  if (remoteCursors.length === 0) {
    return null;
  }

  return (
    <>
      {remoteCursors.map(({ uid, x, y, userName }) => (
        <div
          key={`cursor-${uid}`}
          className="absolute pointer-events-none z-9999 flex flex-col items-start gap-1 transition-all duration-75"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transform: "translate(-2px, -2px)",
          }}
        >
          <MousePointer className="w-5 h-5 text-blue-500 drop-shadow-lg" />
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {userName}
          </div>
        </div>
      ))}
    </>
  );
};

export default memo(RemoteCursorsOverlay);
