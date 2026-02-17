import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { CMSContentSettings } from "@/interfaces/elements.interface";
import { useCMSContentTypes, useCMSContent } from "@/hooks";

const CMSConfiguration: React.FC = () => {
  const selectedElement = useSelectedElement();
  const updateElement = useUpdateElement();
  const element = selectedElement;

  if (!element) return null;

  const settings = (element.settings as CMSContentSettings) || {};
  const isListOrGrid =
    element.type === "CMSContentList" || element.type === "CMSContentGrid";
  const isItem = element.type === "CMSContentItem";

  const { data: contentTypes = [], isLoading: isLoadingTypes } =
    useCMSContentTypes();

  const { contentItems, isLoading: isLoadingItems } = useCMSContent({
    contentTypeId: settings.contentTypeId,
    enabled: !!settings.contentTypeId && isItem,
  });

  const updateSettings = (newSettings: Partial<CMSContentSettings>) => {
    updateElement(element.id, {
      settings: { ...settings, ...newSettings },
    });
  };

  return (
    <AccordionItem value="cms-config">
      <AccordionTrigger className="text-sm font-medium">
        <div className="flex items-center gap-2">CMS Configuration</div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-4">
        {/* Content Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="contentTypeId" className="text-sm font-medium">
            Content Type
          </Label>
          <Select
            value={settings.contentTypeId || ""}
            onValueChange={(value) => updateSettings({ contentTypeId: value })}
            disabled={isLoadingTypes}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingTypes
                    ? "Loading content types..."
                    : "Select content type..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((contentType) => (
                <SelectItem key={contentType.id} value={contentType.id}>
                  {contentType.name || contentType.id}
                </SelectItem>
              ))}
              {contentTypes.length === 0 && !isLoadingTypes && (
                <SelectItem value="" disabled>
                  No content types available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the content type to display from your CMS.
          </p>
        </div>

        {/* Item Slug (for single item display) */}
        {isItem && (
          <div className="space-y-2">
            <Label htmlFor="itemSlug" className="text-sm font-medium">
              Item Slug
            </Label>
            <Select
              value={settings.itemSlug || ""}
              onValueChange={(value) => updateSettings({ itemSlug: value })}
              disabled={isLoadingItems || !settings.contentTypeId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingItems
                      ? "Loading items..."
                      : settings.contentTypeId
                        ? "Select an item..."
                        : "Select content type first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {contentItems.map((item) => (
                  <SelectItem key={item.id} value={item.slug}>
                    {item.title || item.slug}
                  </SelectItem>
                ))}
                {contentItems.length === 0 &&
                  !isLoadingItems &&
                  settings.contentTypeId && (
                    <SelectItem value="" disabled>
                      No items available
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the specific item to display from the selected content
              type.
            </p>
          </div>
        )}

        {/* Display Mode (for list/grid) */}
        {isListOrGrid && (
          <div className="space-y-2">
            <Label htmlFor="displayMode" className="text-sm font-medium">
              Display Mode
            </Label>
            <Select
              value={settings.displayMode || "list"}
              onValueChange={(value: "list" | "grid") =>
                updateSettings({ displayMode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Limit */}
        {isListOrGrid && (
          <div className="space-y-2">
            <Label htmlFor="limit" className="text-sm font-medium">
              Maximum Items
            </Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="100"
              value={settings.limit || 10}
              onChange={(e) =>
                updateSettings({ limit: parseInt(e.target.value) || 10 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of items to display.
            </p>
          </div>
        )}

        {/* Sorting */}
        {isListOrGrid && (
          <>
            <div className="space-y-2">
              <Label htmlFor="sortBy" className="text-sm font-medium">
                Sort By
              </Label>
              <Select
                value={settings.sortBy || "createdAt"}
                onValueChange={(value) =>
                  updateSettings({
                    sortBy: value as "title" | "createdAt" | "updatedAt",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-sm font-medium">
                Sort Order
              </Label>
              <Select
                value={settings.sortOrder || "desc"}
                onValueChange={(value: "asc" | "desc") =>
                  updateSettings({ sortOrder: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Fields to Show (for grid) */}
        {element.type === "CMSContentGrid" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fields to Display</Label>
            <div className="space-y-2">
              {["title", "excerpt", "content", "image", "author", "date"].map(
                (field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Switch
                      id={`field-${field}`}
                      checked={
                        settings.fieldsToShow?.includes(field) ??
                        ["title", "content"].includes(field)
                      }
                      onCheckedChange={(checked) => {
                        const currentFields = settings.fieldsToShow || [
                          "title",
                          "content",
                        ];
                        const newFields = checked
                          ? [...currentFields, field]
                          : currentFields.filter((f) => f !== field);
                        updateSettings({ fieldsToShow: newFields });
                      }}
                    />
                    <Label
                      htmlFor={`field-${field}`}
                      className="text-sm capitalize"
                    >
                      {field}
                    </Label>
                  </div>
                ),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select which fields to display in the grid items.
            </p>
          </div>
        )}

        {/* Filter Options */}
        {isListOrGrid && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filters</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Advanced filtering options will be available here.
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default CMSConfiguration;
