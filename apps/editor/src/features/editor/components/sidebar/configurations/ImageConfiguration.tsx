import {
  useSelectedElement,
  useUpdateElement,
  type ImageSettings,
} from "@/features/editor";
import { CheckCircle2, ImageIcon } from "lucide-react";
import { ConfigPanel, SectionDivider, settingUpdater } from "./_shared";
import {
  ImageAccessibilitySection,
  ImageBehaviorSections,
  ImagePreviewSection,
} from "./ImageSettingsSections";
import { ImageSourceTabs } from "./ImageSourceTabs";

export const ImageConfiguration = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Image") {
    return null;
  }

  const src = selectedElement.src ?? "";
  const alt = selectedElement.content ?? selectedElement.name ?? "";
  const settings: ImageSettings = selectedElement.settings ?? {};
  const objectFit = settings.objectFit ?? "cover";
  const loading = settings.loading ?? "lazy";
  const decoding = settings.decoding ?? "async";
  const hasImage = src.length > 0;

  const updateSetting = settingUpdater(
    updateElement,
    selectedElement.id,
    settings,
  );

  return (
    <ConfigPanel
      value="image-settings"
      icon={<ImageIcon className="h-3.5 w-3.5" />}
      title="Image"
      trailing={
        hasImage && <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
      }
    >
      <div className="flex flex-col gap-3">
        <ImageSourceTabs
          key={selectedElement.id}
          elementId={selectedElement.id}
          src={src}
          onChangeSrc={(nextSrc) =>
            updateElement(selectedElement.id, { src: nextSrc })
          }
          onUploaded={(targetId, { src: nextSrc, alt: nextAlt }) =>
            updateElement(targetId, {
              src: nextSrc,
              content: nextAlt,
              name: nextAlt,
            })
          }
        />

        <SectionDivider />

        <ImageAccessibilitySection
          alt={alt}
          hasImage={hasImage}
          onChangeAlt={(value) =>
            updateElement(selectedElement.id, { content: value })
          }
        />

        <SectionDivider />

        <ImageBehaviorSections
          objectFit={objectFit}
          loading={loading}
          decoding={decoding}
          onUpdateSetting={updateSetting}
        />

        {hasImage && (
          <>
            <SectionDivider />
            <ImagePreviewSection
              key={`${selectedElement.id}:${src}`}
              src={src}
              alt={alt}
              objectFit={objectFit}
            />
          </>
        )}
      </div>
    </ConfigPanel>
  );
};
