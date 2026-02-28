"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Database } from "lucide-react";
import { TypesSidebar } from "./TypesSidebar";
import { CMSTable } from "./CMSTable";
import { CMSProvider } from "../provider/CMSProvider";

function CMSManagerDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 justify-start"
        onClick={() => setOpen(true)}
      >
        <Database className="h-3.5 w-3.5" />
        Open CMS Manager
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw]! w-[92vw] h-[90vh] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              CMS Manager
            </DialogTitle>
          </DialogHeader>

          <CMSProvider>
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <div className="w-52 shrink-0 overflow-hidden">
                <TypesSidebar />
              </div>

              <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                <CMSTable />
              </div>
            </div>
          </CMSProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CMSManagerDialog;
