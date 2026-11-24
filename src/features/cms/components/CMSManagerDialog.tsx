import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Webhook } from "lucide-react";
import { TypesSidebar } from "./TypesSidebar";
import { CMSTable } from "./CMSTable";
import { CollectionAccessBar } from "./CollectionAccessBar";
import { WebhooksTab } from "./WebhooksTab";
import { CMSProvider } from "../provider/CMSProvider";

function CMSManagerDialog({
  projectId,
}: {
  projectId?: string;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"collections" | "webhooks">(
    "collections",
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full gap-2 text-xs"
        onClick={() => setOpen(true)}
      >
        <Database className="size-3.5" />
        Open CMS Manager
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw]! w-[92vw] h-[90vh] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b px-5 py-3 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Database className="size-4" />
              CMS &amp; Backend Data
            </DialogTitle>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                if (val === "collections" || val === "webhooks") {
                  setActiveTab(val);
                }
              }}
            >
              <TabsList className="h-8">
                <TabsTrigger value="collections" className="gap-1.5 text-xs">
                  <Database className="size-3.5" />
                  Collections
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="gap-1.5 text-xs">
                  <Webhook className="size-3.5" />
                  Webhooks
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>

          <CMSProvider projectId={projectId}>
            {activeTab === "collections" ? (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="w-52 shrink-0 overflow-hidden">
                  <TypesSidebar />
                </div>

                <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                  <CollectionAccessBar projectId={projectId} />
                  <CMSTable />
                </div>
              </div>
            ) : (
              <WebhooksTab projectId={projectId} />
            )}
          </CMSProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CMSManagerDialog;
