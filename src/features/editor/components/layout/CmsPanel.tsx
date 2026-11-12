import React from "react";
import { Database } from "lucide-react";
import PanelIntro from "./PanelIntro";

const CMSManagerDialog = React.lazy(
  () => import("@/features/cms/components/CMSManagerDialog"),
);

export default function CmsPanel() {
  return (
    <PanelIntro
      icon={Database}
      title="Content collections"
      description="Define content types and items, then bind them to CMS lists and dynamic pages."
    >
      <CMSManagerDialog />
    </PanelIntro>
  );
}
