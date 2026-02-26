import { CollaboratorRole } from "@/features/collaboration";
import { Crown, Edit, Eye } from "lucide-react";

export const getRoleIcon = (role: CollaboratorRole) => {
  switch (role) {
    case CollaboratorRole.OWNER:
      return <Crown className="h-4 w-4 text-yellow-500" />;
    case CollaboratorRole.EDITOR:
      return <Edit className="h-4 w-4 text-blue-500" />;
    case CollaboratorRole.VIEWER:
      return <Eye className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
};

export const getRoleBadgeVariant = (role: CollaboratorRole) => {
  switch (role) {
    case CollaboratorRole.OWNER:
      return "default";
    case CollaboratorRole.EDITOR:
      return "secondary";
    case CollaboratorRole.VIEWER:
      return "outline";
    default:
      return "outline";
  }
};
