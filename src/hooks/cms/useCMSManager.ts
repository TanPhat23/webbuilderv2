import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsService } from "@/services/cms";
import {
  ContentType,
  ContentItem,
  ContentField,
} from "@/interfaces/cms.interface";
import {
  ContentTypeFormSchema,
  ContentFieldFormSchema,
  ContentItemFormSchema,
} from "@/schema/zod";
import { z } from "zod";

type ContentTypeFormValues = z.infer<typeof ContentTypeFormSchema>;
type ContentFieldFormValues = z.infer<typeof ContentFieldFormSchema>;
type ContentItemFormValues = z.infer<typeof ContentItemFormSchema>;

export const useCMSManager = () => {
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  const queryClient = useQueryClient();

  // Queries
  const { data: contentTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["contentTypes"],
    queryFn: cmsService.getContentTypes,
  });

  const { data: contentFields = [], isLoading: fieldsLoading } = useQuery({
    queryKey: ["contentFields", selectedTypeId],
    queryFn: () => cmsService.getContentFieldsByContentType(selectedTypeId),
    enabled: !!selectedTypeId,
  });

  const { data: contentItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["contentItems", selectedTypeId],
    queryFn: () => cmsService.getContentItemsByContentType(selectedTypeId),
    enabled: !!selectedTypeId,
  });

  // Mutations
  const createTypeMutation = useMutation({
    mutationFn: cmsService.createContentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      console.log("Content type created successfully");
    },
    onError: (error) => {
      console.error("Failed to create content type");
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentType> }) =>
      cmsService.updateContentType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      console.log("Content type updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update content type");
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: cmsService.deleteContentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentTypes"] });
      if (selectedTypeId) setSelectedTypeId("");
      console.log("Content type deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete content type");
    },
  });

  const createFieldMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      data,
    }: {
      contentTypeId: string;
      data: Partial<ContentField>;
    }) => cmsService.createContentField(contentTypeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentFields", selectedTypeId],
      });
      console.log("Content field created successfully");
    },
    onError: (error) => {
      console.error("Failed to create content field");
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      fieldId,
      data,
    }: {
      contentTypeId: string;
      fieldId: string;
      data: Partial<ContentField>;
    }) => cmsService.updateContentField(contentTypeId, fieldId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentFields", selectedTypeId],
      });
      console.log("Content field updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update content field");
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      fieldId,
    }: {
      contentTypeId: string;
      fieldId: string;
    }) => cmsService.deleteContentField(contentTypeId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentFields", selectedTypeId],
      });
      console.log("Content field deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete content field");
    },
  });

  const createItemMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      data,
    }: {
      contentTypeId: string;
      data: Partial<ContentItem>;
    }) => cmsService.createContentItem(contentTypeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentItems", selectedTypeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content-item"],
      });
      console.log("Content item created successfully");
    },
    onError: (error) => {
      console.error("Failed to create content item:", error);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      itemId,
      data,
    }: {
      contentTypeId: string;
      itemId: string;
      data: Partial<ContentItem>;
    }) => cmsService.updateContentItem(contentTypeId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentItems", selectedTypeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content-item"],
      });
      console.log("Content item updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update content item");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({
      contentTypeId,
      itemId,
    }: {
      contentTypeId: string;
      itemId: string;
    }) => cmsService.deleteContentItem(contentTypeId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentItems", selectedTypeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cms-public-content-item"],
      });
      console.log("Content item deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete content item");
    },
  });

  // Handlers
  const handleCreateType = (data: ContentTypeFormValues) => {
    createTypeMutation.mutate(data);
  };

  const handleCreateField = (data: ContentFieldFormValues) => {
    if (selectedTypeId) {
      createFieldMutation.mutate({ contentTypeId: selectedTypeId, data });
    }
  };

  const handleCreateItem = (data: ContentItemFormValues) => {
    if (selectedTypeId) {
      createItemMutation.mutate({ contentTypeId: selectedTypeId, data });
    }
  };

  const selectType = (typeId: string) => {
    setSelectedTypeId(typeId);
  };

  return {
    // State
    selectedTypeId,

    // Data
    contentTypes,
    contentFields,
    contentItems,
    typesLoading,
    fieldsLoading,
    itemsLoading,

    // Mutations
    createTypeMutation,
    updateTypeMutation,
    deleteTypeMutation,
    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,

    // Handlers
    handleCreateType,
    handleCreateField,
    handleCreateItem,
    selectType,
  };
};
