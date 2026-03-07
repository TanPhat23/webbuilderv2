import { jsx } from "react/jsx-runtime";
import { A as Accordion } from "./accordion-D43pR8IL.js";
import React__default, { Suspense } from "react";
import "./project.service-Bci2lGYe.js";
import "./prisma-BUnO9f9X.js";
import { d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import "lucide-react";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
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
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-CEa84Ygm.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-D5_jSc2n.js";
import "./checkbox-Cs4k79tJ.js";
const LinkConfigurationAccordion = React__default.lazy(
  () => import("./LinkConfiguration-BhcXx_FS.js").then((m) => ({
    default: m.LinkConfigurationAccordion
  }))
);
const FormConfigurationAccordion = React__default.lazy(
  () => import("./FormConfiguration-l8Uj516o.js").then((m) => ({
    default: m.FormConfigurationAccordion
  }))
);
const InputConfiguration = React__default.lazy(() => import("./InputConfiguration-EfxsmpLu.js"));
const SelectConfigurationAccordion = React__default.lazy(
  () => import("./SelectConfiguration-H8UHrXCI.js").then((m) => ({
    default: m.SelectConfigurationAccordion
  }))
);
const ImageConfiguration = React__default.lazy(
  () => import("./ImageConfiguration-GR8eRARY.js").then((m) => ({
    default: m.ImageConfiguration
  }))
);
const CarouselConfigurationAccordion = React__default.lazy(
  () => import("./CarouselConfiguration-CRCtaWW_.js")
);
const CMSConfiguration = React__default.lazy(() => import("./CMSConfiguration-t5qE5-8G.js"));
const HeadingConfiguration = React__default.lazy(() => import("./HeadingConfiguration-CZq76-Ff.js"));
const VideoConfiguration = React__default.lazy(() => import("./VideoConfiguration-CuwdDAZA.js"));
const AudioConfiguration = React__default.lazy(() => import("./AudioConfiguration-DR37m8nL.js"));
const IFrameConfiguration = React__default.lazy(() => import("./IFrameConfiguration-CpgfC0Pi.js"));
const TextareaConfiguration = React__default.lazy(
  () => import("./TextareaConfiguration-BeVS_bZg.js")
);
const CheckboxConfiguration = React__default.lazy(
  () => import("./CheckboxConfiguration-RL8pLuYS.js")
);
const RadioConfiguration = React__default.lazy(() => import("./RadioConfiguration-k6VGSQaB.js"));
const ProgressConfiguration = React__default.lazy(
  () => import("./ProgressConfiguration-WMlw70M9.js")
);
const BlockquoteConfiguration = React__default.lazy(
  () => import("./BlockquoteConfiguration-ChCVxZGl.js")
);
const CodeConfiguration = React__default.lazy(() => import("./CodeConfiguration-D8YdFniW.js"));
const IconConfiguration = React__default.lazy(() => import("./IconConfiguration-DEefeKAp.js"));
const TableConfiguration = React__default.lazy(() => import("./TableConfiguration-BwWCxWMX.js"));
const ButtonConfiguration = React__default.lazy(() => import("./ButtonConfiguration-CisYD8Ty.js"));
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
