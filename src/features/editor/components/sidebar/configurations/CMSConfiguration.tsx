import React, { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  useSelectedElement,
  useUpdateElement,
  type CMSContentSettings,
} from "@/features/editor";
import {
  useCMSContent,
  useCMSContentTypes,
} from "@/features/cms/hooks/useCMSContent";
import { Database } from "lucide-react";
import { readCMSSettings } from "../../../lib/cmsConfig";
import { ConfigPanel, SectionDivider } from "./_shared";
import { CMSDataSourceSection, CMSItemSection } from "./CMSDataSourceSections";
import {
  CMSDisplaySection,
  CMSSortingSection,
  CMSVisibleFieldsSection,
} from "./CMSListSections";

const CMSConfiguration: React.FC = () => {
  const selectedElement = useSelectedElement();
  const updateElement = useUpdateElement();

  const cmsElement =
    selectedElement?.type === "CMSContentList" ||
    selectedElement?.type === "CMSContentGrid" ||
    selectedElement?.type === "CMSContentItem"
      ? selectedElement
      : undefined;

  const settings = readCMSSettings(cmsElement?.settings);
  const isListOrGrid =
    cmsElement?.type === "CMSContentList" ||
    cmsElement?.type === "CMSContentGrid";
  const isItem = cmsElement?.type === "CMSContentItem";
  const isGrid = cmsElement?.type === "CMSContentGrid";

  const { data: contentTypes = [], isLoading: isLoadingTypes } =
    useCMSContentTypes();
  const { contentItems, isFetching: isLoadingItems } = useCMSContent({
    contentTypeId: settings.contentTypeId,
    enabled: !!settings.contentTypeId && isItem,
  });

  const updateSettings = useCallback(
    (patch: Partial<CMSContentSettings>) => {
      if (!cmsElement) return;
      updateElement(cmsElement.id, {
        settings: { ...(cmsElement.settings ?? {}), ...patch },
      });
    },
    [cmsElement, updateElement],
  );

  if (!cmsElement) return null;

  const selectedContentType = contentTypes.find(
    (ct) => ct.id === settings.contentTypeId,
  );
  const hasContentType = Boolean(settings.contentTypeId);

  return (
    <ConfigPanel
      value="cms-config"
      icon={<Database className="h-3.5 w-3.5" />}
      title="CMS Content"
      trailing={
        selectedContentType && (
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[9px] font-medium"
          >
            {selectedContentType.name}
          </Badge>
        )
      }
    >
      <div className="flex flex-col gap-3">
        <CMSDataSourceSection
          contentTypeId={settings.contentTypeId || ""}
          selectedTypeName={selectedContentType?.name}
          contentTypes={contentTypes}
          isLoadingTypes={isLoadingTypes}
          onSelectType={(id) =>
            updateSettings(
              isItem && id !== settings.contentTypeId
                ? { contentTypeId: id, itemSlug: "" }
                : { contentTypeId: id },
            )
          }
        />

        {isItem && hasContentType && (
          <>
            <SectionDivider />
            <CMSItemSection
              contentTypeId={settings.contentTypeId}
              itemSlug={settings.itemSlug || ""}
              contentItems={contentItems}
              isLoadingItems={isLoadingItems}
              onSelectSlug={(slug) => updateSettings({ itemSlug: slug })}
            />
          </>
        )}

        {isListOrGrid && hasContentType && (
          <>
            <SectionDivider />
            <CMSDisplaySection
              key={cmsElement.id}
              limit={settings.limit}
              defaultLimit={isGrid ? 6 : 10}
              onUpdate={updateSettings}
            />
            <SectionDivider />
            <CMSSortingSection
              sortBy={settings.sortBy}
              sortOrder={settings.sortOrder}
              onUpdate={updateSettings}
            />
          </>
        )}

        {isGrid && hasContentType && (
          <>
            <SectionDivider />
            <CMSVisibleFieldsSection
              fieldsToShow={settings.fieldsToShow}
              onUpdate={updateSettings}
            />
          </>
        )}
      </div>
    </ConfigPanel>
  );
};

export default CMSConfiguration;
