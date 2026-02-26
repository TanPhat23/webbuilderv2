import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useCMSManager } from "@/features/cms";
import { ContentTypesTab } from "./tabs/ContentTypesTab";
import { ContentFieldsTab } from "./tabs/ContentFieldsTab";
import { ContentItemsTab } from "./tabs/ContentItemsTab";
import { Database, Settings, FileText } from "lucide-react";

const CMSManager = () => {
  const [open, setOpen] = useState(false);

  const {
    selectedTypeId,
    contentTypes,
    contentFields,
    contentItems,
    typesLoading,
    fieldsLoading,
    itemsLoading,
    createTypeMutation,
    updateTypeMutation,
    deleteTypeMutation,
    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    handleCreateType,
    handleCreateField,
    handleCreateItem,
    selectType,
  } = useCMSManager();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full">
          <Database className="h-4 w-4" />
          Manage CMS
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-[75vw] max-h-[95vh] h-[75vw] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CMS Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="types" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="types" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Content Types
              </TabsTrigger>
              <TabsTrigger value="fields" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Fields
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Content Items
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="types">
                <ContentTypesTab
                  contentTypes={contentTypes}
                  isLoading={typesLoading}
                  createTypeMutation={createTypeMutation}
                  updateTypeMutation={updateTypeMutation}
                  deleteTypeMutation={deleteTypeMutation}
                  onSelectType={selectType}
                  onCreateType={handleCreateType}
                  onDeleteType={(typeId) => deleteTypeMutation.mutate(typeId)}
                />
              </TabsContent>

              <TabsContent value="fields">
                <ContentFieldsTab
                  selectedTypeId={selectedTypeId}
                  contentTypes={contentTypes}
                  contentFields={contentFields}
                  isLoading={fieldsLoading}
                  createFieldMutation={createFieldMutation}
                  updateFieldMutation={updateFieldMutation}
                  deleteFieldMutation={deleteFieldMutation}
                  onCreateField={handleCreateField}
                  onDeleteField={(contentTypeId, fieldId) =>
                    deleteFieldMutation.mutate({ contentTypeId, fieldId })
                  }
                />
              </TabsContent>

              <TabsContent value="items">
                <ContentItemsTab
                  selectedTypeId={selectedTypeId}
                  contentTypes={contentTypes}
                  contentFields={contentFields}
                  contentItems={contentItems}
                  isLoading={itemsLoading}
                  createItemMutation={createItemMutation}
                  updateItemMutation={updateItemMutation}
                  deleteItemMutation={deleteItemMutation}
                  onCreateItem={handleCreateItem}
                  onDeleteItem={(contentTypeId, itemId) =>
                    deleteItemMutation.mutate({ contentTypeId, itemId })
                  }
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CMSManager;
