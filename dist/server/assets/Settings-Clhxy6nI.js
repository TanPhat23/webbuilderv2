import { jsx } from "react/jsx-runtime";
import { A as Accordion } from "./accordion-Dg3retHz.js";
import React__default, { Suspense } from "react";
import "./prisma-Cq49YOYM.js";
import { d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import "lucide-react";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-DZpoDDoq.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-BDhK7YnG.js";
import "./checkbox-BX2VzNwa.js";
const LinkConfigurationAccordion = React__default.lazy(
  () => import("./LinkConfiguration-D9c4YLS0.js").then((m) => ({
    default: m.LinkConfigurationAccordion
  }))
);
const FormConfigurationAccordion = React__default.lazy(
  () => import("./FormConfiguration-CtmMy91M.js").then((m) => ({
    default: m.FormConfigurationAccordion
  }))
);
const InputConfiguration = React__default.lazy(() => import("./InputConfiguration-DZx3bnss.js"));
const SelectConfigurationAccordion = React__default.lazy(
  () => import("./SelectConfiguration-BHetzdUL.js").then((m) => ({
    default: m.SelectConfigurationAccordion
  }))
);
const ImageConfiguration = React__default.lazy(
  () => import("./ImageConfiguration-DSpQDbrC.js").then((m) => ({
    default: m.ImageConfiguration
  }))
);
const CarouselConfigurationAccordion = React__default.lazy(
  () => import("./CarouselConfiguration-D-TIoAo4.js")
);
const CMSConfiguration = React__default.lazy(() => import("./CMSConfiguration-ozGz6vd8.js"));
const HeadingConfiguration = React__default.lazy(() => import("./HeadingConfiguration-Chdvkzh9.js"));
const VideoConfiguration = React__default.lazy(() => import("./VideoConfiguration-Da_PxBZH.js"));
const AudioConfiguration = React__default.lazy(() => import("./AudioConfiguration-QlsvmTmg.js"));
const IFrameConfiguration = React__default.lazy(() => import("./IFrameConfiguration-B67ACv8H.js"));
const TextareaConfiguration = React__default.lazy(
  () => import("./TextareaConfiguration-BUP1iPKF.js")
);
const CheckboxConfiguration = React__default.lazy(
  () => import("./CheckboxConfiguration-CtBR0QEk.js")
);
const RadioConfiguration = React__default.lazy(() => import("./RadioConfiguration-5HTLsoXU.js"));
const ProgressConfiguration = React__default.lazy(
  () => import("./ProgressConfiguration-CWkNgZcW.js")
);
const BlockquoteConfiguration = React__default.lazy(
  () => import("./BlockquoteConfiguration-BAIxU44y.js")
);
const CodeConfiguration = React__default.lazy(() => import("./CodeConfiguration-5tFnGJmr.js"));
const IconConfiguration = React__default.lazy(() => import("./IconConfiguration-BrO8Vwwk.js"));
const TableConfiguration = React__default.lazy(() => import("./TableConfiguration-NT0IOw0r.js"));
const ButtonConfiguration = React__default.lazy(() => import("./ButtonConfiguration-iKNXHfrP.js"));
function ConfigurationFallback() {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-6", children: /* @__PURE__ */ jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" }) });
}
function Settings() {
  const selectedElement = useSelectedElement();
  const renderChildElement = (type) => {
    if (!type) {
      return null;
    }
    switch (type) {
      // Interactive
      case "Link":
        return /* @__PURE__ */ jsx(LinkConfigurationAccordion, {});
      case "Button":
        return /* @__PURE__ */ jsx(ButtonConfiguration, {});
      // Form
      case "Form":
        return /* @__PURE__ */ jsx(FormConfigurationAccordion, {});
      case "Input":
        return /* @__PURE__ */ jsx(InputConfiguration, {});
      case "Textarea":
        return /* @__PURE__ */ jsx(TextareaConfiguration, {});
      case "Select":
        return /* @__PURE__ */ jsx(SelectConfigurationAccordion, {});
      case "Checkbox":
        return /* @__PURE__ */ jsx(CheckboxConfiguration, {});
      case "Radio":
        return /* @__PURE__ */ jsx(RadioConfiguration, {});
      case "Progress":
        return /* @__PURE__ */ jsx(ProgressConfiguration, {});
      // Media
      case "Image":
        return /* @__PURE__ */ jsx(ImageConfiguration, {});
      case "Video":
        return /* @__PURE__ */ jsx(VideoConfiguration, {});
      case "Audio":
        return /* @__PURE__ */ jsx(AudioConfiguration, {});
      case "IFrame":
        return /* @__PURE__ */ jsx(IFrameConfiguration, {});
      // Inline / Leaf
      case "Heading":
        return /* @__PURE__ */ jsx(HeadingConfiguration, {});
      case "Blockquote":
        return /* @__PURE__ */ jsx(BlockquoteConfiguration, {});
      case "Code":
        return /* @__PURE__ */ jsx(CodeConfiguration, {});
      case "Icon":
        return /* @__PURE__ */ jsx(IconConfiguration, {});
      // Table
      case "Table":
        return /* @__PURE__ */ jsx(TableConfiguration, {});
      // Carousel
      case "Carousel":
        return /* @__PURE__ */ jsx(CarouselConfigurationAccordion, {});
      // CMS
      case "CMSContentList":
      case "CMSContentItem":
      case "CMSContentGrid":
        return selectedElement ? /* @__PURE__ */ jsx(CMSConfiguration, {}) : null;
      default:
        return null;
    }
  };
  if (!selectedElement) {
    return null;
  }
  const content = renderChildElement(selectedElement.type);
  if (!content) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-sm text-muted-foreground", children: "No configurations available for this element." });
  }
  return /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(Accordion, { type: "multiple", className: "w-full", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ConfigurationFallback, {}), children: content }) }) });
}
export {
  Settings as default
};
