import React from "react";
import type { AudioElement, VideoElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function MediaView({ element, rootProps }: ViewProps<AudioElement | VideoElement>) {
  const settings = element.settings;
  const media = {
    ...rootProps, src: element.src || undefined, controls: settings?.controls ?? true,
    autoPlay: settings?.autoplay ?? false, muted: settings?.muted ?? false,
    loop: settings?.loop ?? false, preload: settings?.preload ?? "metadata",
  };
  if (element.type === "Audio") return <audio {...media} />;
  return <video {...media} playsInline={element.settings?.playsInline ?? true}
    poster={element.settings?.poster} style={{ objectFit: element.settings?.objectFit, ...rootProps.style }} />;
}
